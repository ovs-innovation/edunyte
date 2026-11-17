import { useRole } from '@/contexts/RoleContext';
import { Role, getRoleMetadata } from '@/lib/rbac';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield } from 'lucide-react';

export function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useRole();
  const roles: Role[] = [currentRole || 'super_admin'];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 rounded-lg border border-border bg-card/50 px-2 sm:px-3 py-1 sm:py-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline text-xs font-medium">Your Role:</span>
      </div>
      <Select value={currentRole} onValueChange={(value) => setCurrentRole(value as Role)}>
        <SelectTrigger className="h-7 sm:h-8 w-[95px] sm:w-[130px] border-0 bg-transparent text-xs sm:text-sm p-0 sm:px-2 focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => {
            const meta = getRoleMetadata(role);
            return (
            <SelectItem key={role} value={role}>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${
                    meta.color.split(' ')[0]
                  }`}
                />
                {meta.label}
              </div>
            </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
