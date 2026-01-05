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
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-3 py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span className="text-xs font-medium">Your Role:</span>
      </div>
      <Select value={currentRole} onValueChange={(value) => setCurrentRole(value as Role)}>
        <SelectTrigger className="h-8 w-[140px] border-0 bg-transparent text-sm">
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
