import { query } from '../config/db.js';
import { redis } from '../config/redis.js';
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_CATALOG,
} from './catalog.js';

const SETTINGS_KEY = 'role_permissions';
const CACHE_KEY = 'permissions:matrix';
const CACHE_TTL = 60;

function normalizeMatrix(raw) {
  const matrix = { ...DEFAULT_ROLE_PERMISSIONS };
  if (!raw || typeof raw !== 'object') return matrix;

  for (const role of ['receptionist', 'doctor', 'pharmacist', 'admin']) {
    if (Array.isArray(raw[role])) {
      matrix[role] = raw[role].filter((p) => p === '*' || ALL_PERMISSION_KEYS.includes(p));
    }
  }
  if (!matrix.admin?.includes('*')) {
    matrix.admin = ['*'];
  }
  return matrix;
}

export async function getPermissionMatrix() {
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const { rows } = await query(
    `SELECT value FROM clinic_settings WHERE key = $1`,
    [SETTINGS_KEY]
  );
  const raw = rows[0]?.value;
  const matrix = normalizeMatrix(typeof raw === 'string' ? JSON.parse(raw) : raw);
  await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(matrix));
  return matrix;
}

export async function savePermissionMatrix(matrix) {
  const normalized = normalizeMatrix(matrix);
  await query(
    `INSERT INTO clinic_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [SETTINGS_KEY, JSON.stringify(normalized)]
  );
  await redis.del(CACHE_KEY);
  return normalized;
}

export async function getPermissionsForRole(role) {
  const matrix = await getPermissionMatrix();
  const perms = matrix[role] || [];
  if (perms.includes('*')) return ALL_PERMISSION_KEYS;
  return perms;
}

export function roleHasPermission(rolePermissions, permission) {
  if (rolePermissions.includes('*')) return true;
  return rolePermissions.includes(permission);
}

export async function checkPermission(role, permission) {
  if (role === 'admin') {
    const matrix = await getPermissionMatrix();
    if (matrix.admin?.includes('*')) return true;
  }
  const perms = await getPermissionsForRole(role);
  return roleHasPermission(perms, permission);
}

export function getCatalogWithDefaults(matrix) {
  return {
    catalog: PERMISSION_CATALOG,
    roles: ['receptionist', 'doctor', 'pharmacist'],
    matrix,
    defaults: DEFAULT_ROLE_PERMISSIONS,
  };
}

export async function seedDefaultPermissions() {
  const { rows } = await query(`SELECT 1 FROM clinic_settings WHERE key = $1`, [SETTINGS_KEY]);
  if (rows.length === 0) {
    await savePermissionMatrix(DEFAULT_ROLE_PERMISSIONS);
  }
}
