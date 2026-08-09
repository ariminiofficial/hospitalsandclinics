import { useAuth } from '../auth/AuthContext.jsx';

export function usePermissions() {
  const { user } = useAuth();
  const perms = user?.permissions || [];

  const can = (permission) => {
    if (!user) return false;
    if (user.role === 'admin' && (perms.includes('*') || perms.length === 0)) return true;
    if (perms.includes('*')) return true;
    return perms.includes(permission);
  };

  const canAny = (...permissions) => permissions.some((p) => can(p));

  return { can, canAny, permissions: perms, role: user?.role };
}
