import { NavLink } from '@/components/NavLink';
import { useRole } from '@/contexts/RoleContext';
import { PermissionGate } from '@/components/PermissionGate';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  BarChart3,
  FileText,
  ChevronLeft,
  Menu,
  Gauge,
  MessageSquare,
  Bell,
  Star,
  GraduationCap,
  UserCircle,
  BookOpen,
  Languages,
  FolderTree,
  CheckCircle,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const adminNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard.view' as const },
  { to: '/users', icon: Users, label: 'Users', permission: 'users.view' as const },
  { to: '/teachers', icon: GraduationCap, label: 'Teachers', permission: 'teachers.view' as const },
  { to: '/students', icon: UserCircle, label: 'Students', permission: 'students.view' as const },
  { to: '/teacher-approvals', icon: CheckCircle, label: 'TCAR', permission: 'teacher_courses.view' as const },
  { to: '/roles', icon: Shield, label: 'Roles', permission: 'roles.view' as const },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', permission: 'analytics.view' as const },
  { to: '/reports', icon: FileText, label: 'Reports', permission: 'reports.view' as const },
  { to: '/support-tickets', icon: MessageSquare, label: 'Support', permission: 'users.view' as const },
  { to: '/announcements', icon: Bell, label: 'Announcements', permission: 'settings.view' as const },
  { to: '/reviews', icon: Star, label: 'Reviews', permission: 'users.view' as const },
  { to: '/payments', icon: DollarSign, label: 'Payments', permission: 'users.view' as const },
  { to: '/settings', icon: Settings, label: 'Settings', permission: 'settings.view' as const },
];

// Course Management sub-items
const courseManagementItems = [
  { to: '/courses', icon: BookOpen, label: 'Courses', permission: 'courses.view' as const },
  { to: '/categories', icon: FolderTree, label: 'Categories', permission: 'categories.view' as const },
];

const teacherNavItems = [
  { to: '/teacher-dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard.view' as const },
  { to: '/teacher-profile', icon: Users, label: 'My Profile', permission: 'profile.own' as const },
  { to: '/teacher/join-course', icon: Plus, label: 'Join Course', permission: 'teacher_courses.create' as const },
  { to: '/teacher/my-courses', icon: BookOpen, label: 'My Courses', permission: 'teacher_courses.view' as const },
  { to: '/teacher/availability', icon: Calendar, label: 'Availability', permission: 'teacher_courses.view' as const },
  { to: '/teacher/bookings', icon: Calendar, label: 'My Bookings', permission: 'teacher_courses.view' as const },
  { to: '/students', icon: UserCircle, label: 'My Students', permission: 'students.view' as const },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', permission: 'analytics.view' as const },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [courseManagementOpen, setCourseManagementOpen] = useState(true);
  const { currentRole } = useRole();
  const navItems = currentRole === 'teacher' ? teacherNavItems : adminNavItems;
  const name = sessionStorage.getItem('user-name') || '';
  const email = sessionStorage.getItem('user-email') || '';
  const displayName = name || email || 'User';

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/assets/img/logo/edunyte-light.png" alt="Logo" width={100} height={100} />
            {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div> */}
            {/* <span className="text-lg font-semibold text-foreground">AdminHub</span> */}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {/* Dashboard */}
        {navItems.slice(0, 1).map((item) => (
          <PermissionGate key={item.to} permission={item.permission}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-2'
              )}
              activeClassName="bg-sidebar-accent text-sidebar-primary shadow-glow"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </PermissionGate>
        ))}
        
        {/* Course Management Collapsible - Right after Dashboard */}
        {currentRole !== 'teacher' && (
          <PermissionGate permission="courses.view">
            <Collapsible
              open={courseManagementOpen}
              onOpenChange={setCourseManagementOpen}
              className="space-y-1"
            >
              <CollapsibleTrigger
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-2',
                  courseManagementOpen && 'bg-sidebar-accent/50'
                )}
              >
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">Course Management</span>
                    {courseManagementOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </>
                )}
              </CollapsibleTrigger>
              {!collapsed && (
                <CollapsibleContent className="space-y-1 pl-4">
                  {courseManagementItems.map((item) => (
                    <PermissionGate key={item.to} permission={item.permission}>
                      <NavLink
                        to={item.to}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                        activeClassName="bg-sidebar-accent text-sidebar-primary shadow-glow"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    </PermissionGate>
                  ))}
                </CollapsibleContent>
              )}
            </Collapsible>
          </PermissionGate>
        )}

        {/* Rest of the menu items */}
        {navItems.slice(1).map((item) => (
          <PermissionGate key={item.to} permission={item.permission}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-2'
              )}
              activeClassName="bg-sidebar-accent text-sidebar-primary shadow-glow"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </PermissionGate>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div
          className={cn(
            'flex items-center gap-3',
            collapsed && 'justify-center'
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
            AT
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentRole.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
