import { ApiUser } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getRoleMetadata } from '@/lib/rbac';

type Props = {
  open: boolean;
  user: ApiUser | null;
  onClose: () => void;
};

const statusStyles: Record<string, string> = {
  active: 'bg-success/20 text-success border-success/30',
  inactive: 'bg-muted text-muted-foreground border-muted',
  pending: 'bg-warning/20 text-warning border-warning/30',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '—';

export function UserViewDialog({ open, user, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{user.name || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <Badge
                variant="outline"
                className={cn('border capitalize', getRoleMetadata(user.role).color)}
              >
                {getRoleMetadata(user.role).label}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className={cn(
                  'border capitalize',
                  statusStyles[user.status] || 'bg-muted text-muted-foreground border-muted'
                )}
              >
                {user.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last login</span>
              <span className="text-foreground">{formatDate(user.lastLogin)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span className="text-foreground">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

