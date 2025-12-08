export const roles = ['super_admin', 'admin', 'teacher'];

export const permissions = [
  'dashboard.view',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'roles.view',
  'roles.manage',
  'settings.view',
  'settings.edit',
  'analytics.view',
  'reports.view',
  'reports.export',
];

export const rolePermissions = {
  super_admin: [...permissions],
  admin: [
    'dashboard.view',
    'users.view',
    'users.create',
    'users.edit',
    'roles.view',
    'settings.view',
    'settings.edit',
    'analytics.view',
    'reports.view',
    'reports.export',
  ],
  teacher: [
    'dashboard.view',
    'users.view',
    'users.create',
    'users.edit',
    'analytics.view',
    'reports.view',
    'reports.export',
  ],
};

export const hasPermission = (role, permission) => rolePermissions[role]?.includes(permission) || false;

