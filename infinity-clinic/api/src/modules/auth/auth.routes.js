import { Router } from 'express';
import { z } from 'zod';
import * as authService from './auth.service.js';
import { authenticate } from '../../middleware/auth.js';
import { loginLimiter } from '../../middleware/rateLimit.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';
import { loginInput } from '../../schema/index.js';

const router = Router();
const REFRESH_COOKIE = 'refresh_token';

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginInput.parse(req.body);
    const result = await authService.login(email, password);
    setRefreshCookie(res, result.refreshToken);
    res.json({ accessToken: result.accessToken, user: result.user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    }
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
      throw new AppError('No refresh token', 401, 'UNAUTHORIZED');
    }
    const result = await authService.refresh(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie(REFRESH_COOKIE, {
      path: '/api/auth',
      secure: env.cookieSecure,
      sameSite: env.cookieSecure ? 'none' : 'lax',
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
