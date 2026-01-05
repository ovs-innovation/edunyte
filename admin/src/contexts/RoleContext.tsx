import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useThemeColor } from '@/contexts/ThemeColorContext';
import { AuthAPI, ROLE_KEY, TOKEN_KEY } from '@/lib/api';
import { Role, Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/rbac';

interface RoleContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  permissions: Permission[];
  setPermissions: (perms: Permission[]) => void;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { setThemeColor } = useThemeColor();
  const [currentRole, setCurrentRoleState] = useState<Role>(() => (localStorage.getItem(ROLE_KEY) as Role) || '');
  const [permissions, setPermissionsState] = useState<Permission[]>([]);

  const setCurrentRole = (role: Role) => {
    setCurrentRoleState(role);
    localStorage.setItem(ROLE_KEY, role);
  };

  const setPermissions = (perms: Permission[]) => {
    setPermissionsState(perms || []);
  };

  useEffect(() => {
    const syncRole = async () => {
      const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      if (!token) return;
      try {
        const data = await AuthAPI.me();
        if (data.user?.role) {
          setCurrentRole(data.user.role);
        }
        if (data.user?.permissions) {
          setPermissions(data.user.permissions as Permission[]);
        }
        try {
          const settingsData = await import('@/lib/api').then(m => m.SettingsAPI.get());
          const colorMap = {
            sky: 'sky', violet: 'violet', emerald: 'emerald', rose: 'rose', amber: 'amber', orange: 'orange',
            teal: 'teal', pink: 'pink', indigo: 'indigo', cyan: 'cyan', lime: 'lime', red: 'red'
          };
          const mappedColor = colorMap[settingsData.settings.themeColor] || 'sky';
          setThemeColor(mappedColor);
        } catch (e) { setThemeColor('sky'); }
      } catch {
        setCurrentRoleState('');
        setPermissionsState([]);
      }
    };
    syncRole();
  }, []);

  const can = (permission: Permission) => hasPermission(permissions, permission);
  const canAny = (perms: Permission[]) => hasAnyPermission(permissions, perms);
  const canAll = (perms: Permission[]) => hasAllPermissions(permissions, perms);

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, permissions, setPermissions, can, canAny, canAll }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
