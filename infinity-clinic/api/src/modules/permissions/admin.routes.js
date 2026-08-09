import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import {
  getCatalogWithDefaults,
  getPermissionMatrix,
  savePermissionMatrix,
} from '../../permissions/service.js';

const router = Router();

router.use(authenticate);

router.get('/me', async (req, res, next) => {
  try {
    const matrix = await getPermissionMatrix();
    const perms = matrix[req.user.role] || [];
    res.json({ role: req.user.role, permissions: perms });
  } catch (err) {
    next(err);
  }
});

router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const matrix = await getPermissionMatrix();
    res.json(getCatalogWithDefaults(matrix));
  } catch (err) {
    next(err);
  }
});

router.put('/', authorize('admin'), requirePermission('settings.permissions'), async (req, res, next) => {
  try {
    const { matrix } = req.body;
    const saved = await savePermissionMatrix(matrix);
    res.json(getCatalogWithDefaults(saved));
  } catch (err) {
    next(err);
  }
});

router.post('/reset', authorize('admin'), async (req, res, next) => {
  try {
    const { DEFAULT_ROLE_PERMISSIONS } = await import('../../permissions/catalog.js');
    const saved = await savePermissionMatrix(DEFAULT_ROLE_PERMISSIONS);
    res.json(getCatalogWithDefaults(saved));
  } catch (err) {
    next(err);
  }
});

export default router;
