
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
  'courses.view',
  'courses.create',
  'courses.edit',
  'courses.delete',
  'students.view',
  'students.create',
  'students.edit',
  'students.delete',
];

export const rolePermissions = {
  super_admin: [...permissions],
};

export const hasPermission = (role, permission) => rolePermissions[role]?.includes(permission) || false;

