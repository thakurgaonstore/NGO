import { useAuth } from '../auth/AuthContext';

/**
 * Hook to evaluate whether the current user has permission to perform an action.
 * SuperAdmins and Owners have wildcard permissions (*).
 */
export function useCan() {
  const { role, isSuperAdmin, can } = useAuth();

  const check = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    if (role === 'owner') return true;
    return can(permission);
  };

  return { can: check, role, isSuperAdmin };
}
