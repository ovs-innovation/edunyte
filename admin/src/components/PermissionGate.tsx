import { ReactNode } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Permission } from '@/lib/rbac';

interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAny, canAll } = useRole();

  let hasAccess = false;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
