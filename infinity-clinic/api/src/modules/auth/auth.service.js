import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/db.js';
import { redis, REFRESH_TOKEN_PREFIX } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getPermissionsForRole } from '../../permissions/service.js';

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

function signAccessToken(user, profile = {}) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      doctorId: profile.doctorId || null,
      receptionistId: profile.receptionistId || null,
      pharmacistId: profile.pharmacistId || null,
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
}

function signRefreshToken(userId, tokenId) {
  return jwt.sign({ sub: userId, jti: tokenId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
}

async function getProfileForUser(user) {
  if (user.role === 'doctor') {
    const { rows } = await query(
      `SELECT id, full_name, specialization FROM doctors WHERE user_id = $1 AND is_active = true`,
      [user.id]
    );
    return {
      doctorId: rows[0]?.id || null,
      doctorName: rows[0]?.full_name || null,
      specialization: rows[0]?.specialization || null,
    };
  }
  if (user.role === 'receptionist') {
    const { rows } = await query(
      'SELECT id FROM receptionists WHERE user_id = $1 AND is_active = true',
      [user.id]
    );
    return { receptionistId: rows[0]?.id || null };
  }
  if (user.role === 'pharmacist') {
    const { rows } = await query(
      'SELECT id, full_name FROM pharmacists WHERE user_id = $1 AND is_active = true',
      [user.id]
    );
    return {
      pharmacistId: rows[0]?.id || null,
      pharmacistName: rows[0]?.full_name || null,
    };
  }
  return {};
}

export async function login(email, password) {
  const { rows } = await query(
    'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  const user = rows[0];
  if (!user || !user.is_active) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const profile = await getProfileForUser(user);
  const permissions = await getPermissionsForRole(user.role);
  const accessToken = signAccessToken(user, profile);
  const tokenId = uuidv4();
  const refreshToken = signRefreshToken(user.id, tokenId);

  await redis.setex(`${REFRESH_TOKEN_PREFIX}${tokenId}`, REFRESH_TTL_SECONDS, user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions,
      ...profile,
    },
  };
}

export async function refresh(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH');
  }

  const stored = await redis.get(`${REFRESH_TOKEN_PREFIX}${payload.jti}`);
  if (!stored || stored !== payload.sub) {
    throw new AppError('Refresh token revoked', 401, 'INVALID_REFRESH');
  }

  const { rows } = await query(
    'SELECT id, email, role, is_active FROM users WHERE id = $1',
    [payload.sub]
  );
  const user = rows[0];
  if (!user || !user.is_active) {
    throw new AppError('User not found', 401, 'INVALID_REFRESH');
  }

  const profile = await getProfileForUser(user);
  const permissions = await getPermissionsForRole(user.role);
  const accessToken = signAccessToken(user, profile);

  return { accessToken, user: { id: user.id, email: user.email, role: user.role, permissions, ...profile } };
}

export async function logout(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
    await redis.del(`${REFRESH_TOKEN_PREFIX}${payload.jti}`);
  } catch {
    // ignore invalid tokens on logout
  }
}

export async function getMe(userId) {
  const { rows } = await query(
    'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true',
    [userId]
  );
  const user = rows[0];
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  const profile = await getProfileForUser(user);
  const permissions = await getPermissionsForRole(user.role);
  return { ...user, permissions, ...profile };
}
