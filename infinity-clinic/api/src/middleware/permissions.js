import { AppError } from './errorHandler.js';
import { checkPermission } from '../permissions/service.js';

export function requirePermission(...permissions) {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }
    try {
      for (const perm of permissions) {
        const allowed = await checkPermission(req.user.role, perm);
        if (allowed) return next();
      }
      return next(new AppError('You do not have permission for this action', 403, 'FORBIDDEN'));
    } catch (err) {
      next(err);
    }
  };
}
