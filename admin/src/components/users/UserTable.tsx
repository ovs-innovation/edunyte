import { getRoleMetadata } from '@/lib/rbac';
import { PermissionGate } from '@/components/PermissionGate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ApiUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const statusStyles: Record<string, string> = {
  active: 'bg-success/20 text-success border-success/30',
  inactive: 'bg-muted text-muted-foreground border-muted',
  pending: 'bg-warning/20 text-warning border-warning/30',
};

interface Props {
  users: ApiUser[];
  loading: boolean;
  onEdit: (user: ApiUser) => void;
  onDelete: (id: string) => void;
  onView: (user: ApiUser) => void;
  onStatusUpdate?: (id: string, status: string) => void;
}

export function UserTable({ users, loading, onEdit, onDelete, onView, onStatusUpdate }: Props) {
  const { toast } = useToast();

  const formatAvatar = (name: string) =>
    name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">User</TableHead>
            <TableHead className="text-muted-foreground">Role</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Last Login</TableHead>
            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading && users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          )}
          {users.map((user, index) => (
            <TableRow
              key={user.id}
              className="border-border transition-colors hover:bg-muted/30"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {formatAvatar(user.name || user.email)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn('border', getRoleMetadata(user.role).color)}
                >
                  {getRoleMetadata(user.role).label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    'border capitalize',
                    statusStyles[user.status] || 'bg-muted text-muted-foreground border-muted'
                  )}
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2" onSelect={() => onView(user)}>
                      <Eye className="h-4 w-4" /> View
                    </DropdownMenuItem>
                    {user.status === 'pending' && onStatusUpdate && (
                      <PermissionGate permission="users.edit">
                        <DropdownMenuItem 
                          className="gap-2 text-success focus:text-success" 
                          onSelect={() => onStatusUpdate(user.id, 'active')}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </DropdownMenuItem>
                      </PermissionGate>
                    )}
                    <PermissionGate permission="users.edit">
                      <DropdownMenuItem className="gap-2" onSelect={() => onEdit(user)}>
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </PermissionGate>
                    <PermissionGate permission="users.delete">
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onSelect={() => {
                          onDelete(user.id);
                          toast({ title: 'Delete requested' });
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </PermissionGate>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
