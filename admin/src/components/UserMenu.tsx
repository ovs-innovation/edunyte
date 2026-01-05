import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/PermissionGate';
import { useRole } from '@/contexts/RoleContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function UserMenu() {
  const navigate = useNavigate();
  const { currentRole } = useRole();

  const name = localStorage.getItem('user-name') || sessionStorage.getItem('user-name') || '';
  const email = localStorage.getItem('user-email') || sessionStorage.getItem('user-email') || '';
  const displayName = name || email || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleProfile = () => {
    // Navigate to role-specific profile page
    if (currentRole === 'teacher') {
      navigate('/teacher-profile');
    } else {
      navigate('/profile');
    }
    toast.info('Profile opened');
  };

  const handleAppearance = () => {
    navigate('/settings');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
        >
          <span className="text-sm font-medium">{initials}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName}</p>
            {email && <p className="text-xs text-muted-foreground">{email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <PermissionGate permission="settings.view">
          <DropdownMenuItem onClick={handleAppearance} className="cursor-pointer">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </DropdownMenuItem>
        </PermissionGate>

        <PermissionGate permission="settings.view">
          <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </PermissionGate>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
