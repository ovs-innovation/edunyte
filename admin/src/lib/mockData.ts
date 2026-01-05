import { Role } from './rbac';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex@company.com',
    avatar: 'AT',
    role: 'super_admin',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00',
    createdAt: '2023-01-10',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    avatar: 'SC',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-14T15:45:00',
    createdAt: '2023-03-22',
  },
  {
    id: '3',
    name: 'Michael Roberts',
    email: 'michael@company.com',
    avatar: 'MR',
    role: 'manager',
    status: 'active',
    lastLogin: '2024-01-13T09:20:00',
    createdAt: '2023-05-18',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@company.com',
    avatar: 'ED',
    role: 'editor',
    status: 'inactive',
    lastLogin: '2024-01-10T14:00:00',
    createdAt: '2023-07-30',
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james@company.com',
    avatar: 'JW',
    role: 'viewer',
    status: 'pending',
    lastLogin: '2024-01-12T11:15:00',
    createdAt: '2023-09-05',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa@company.com',
    avatar: 'LA',
    role: 'manager',
    status: 'active',
    lastLogin: '2024-01-15T08:00:00',
    createdAt: '2023-04-12',
  },
  {
    id: '7',
    name: 'David Kim',
    email: 'david@company.com',
    avatar: 'DK',
    role: 'editor',
    status: 'active',
    lastLogin: '2024-01-14T16:30:00',
    createdAt: '2023-08-20',
  },
  {
    id: '8',
    name: 'Rachel Green',
    email: 'rachel@company.com',
    avatar: 'RG',
    role: 'viewer',
    status: 'active',
    lastLogin: '2024-01-15T07:45:00',
    createdAt: '2023-11-01',
  },
];

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalRoles: number;
  recentActivity: number;
  storageUsed: number;
}

export const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  activeUsers: 892,
  pendingApprovals: 23,
  totalRoles: 5,
  recentActivity: 156,
  storageUsed: 67,
};

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export const mockActivity: ActivityItem[] = [
  { id: '1', user: 'Alex Thompson', action: 'created', target: 'new user account', timestamp: '2 min ago' },
  { id: '2', user: 'Sarah Chen', action: 'updated', target: 'role permissions', timestamp: '15 min ago' },
  { id: '3', user: 'Michael Roberts', action: 'deleted', target: 'inactive user', timestamp: '1 hour ago' },
  { id: '4', user: 'Emily Davis', action: 'exported', target: 'monthly report', timestamp: '2 hours ago' },
  { id: '5', user: 'James Wilson', action: 'viewed', target: 'analytics dashboard', timestamp: '3 hours ago' },
];
