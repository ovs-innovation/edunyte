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
import { MoreHorizontal, Pencil, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ApiTeacherProfile, ApiUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const kycStatusStyles: Record<string, string> = {
  verified: 'bg-success/20 text-success border-success/30',
  pending: 'bg-warning/20 text-warning border-warning/30',
  rejected: 'bg-destructive/20 text-destructive border-destructive/30',
};

interface Props {
  teachers: Array<ApiTeacherProfile & { userId: ApiUser }>;
  loading: boolean;
  onEdit: (profile: ApiTeacherProfile & { userId: ApiUser }) => void;
  onView: (profile: ApiTeacherProfile & { userId: ApiUser }) => void;
  onKycUpdate?: (userId: string, status: "pending" | "verified" | "rejected") => void;
}

export function TeacherTable({ teachers, loading, onEdit, onView, onKycUpdate }: Props) {
  const { toast } = useToast();

  const formatAvatar = (name: string) =>
    name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);

  const getKycIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Teacher</TableHead>
            <TableHead className="text-muted-foreground">Expertise</TableHead>
            <TableHead className="text-muted-foreground">Experience</TableHead>
            <TableHead className="text-muted-foreground">KYC Status</TableHead>
            <TableHead className="text-muted-foreground">Rating</TableHead>
            <TableHead className="text-muted-foreground">Earnings</TableHead>
            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading && teachers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No teachers found
              </TableCell>
            </TableRow>
          )}
          {teachers.map((teacher, index) => {
            const user = typeof teacher.userId === 'object' ? teacher.userId : null;
            return (
              <TableRow
                key={teacher._id}
                className="border-border transition-colors hover:bg-muted/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {formatAvatar(user?.name || 'T')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user?.name || '—'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || '—'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {teacher.expertise.slice(0, 2).map((exp, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                    {teacher.expertise.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{teacher.expertise.length - 2}
                      </Badge>
                    )}
                    {teacher.expertise.length === 0 && (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {teacher.experience} {teacher.experience === 1 ? 'year' : 'years'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn('border flex items-center gap-1 w-fit', kycStatusStyles[teacher.kycStatus])}
                  >
                    {getKycIcon(teacher.kycStatus)}
                    {teacher.kycStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{teacher.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-xs">({teacher.totalReviews})</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  ₹{teacher.totalEarnings.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="gap-2" onSelect={() => onView(teacher)}>
                        <Eye className="h-4 w-4" /> View
                      </DropdownMenuItem>
                      <PermissionGate permission="teachers.manage">
                        <DropdownMenuItem className="gap-2" onSelect={() => onEdit(teacher)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {teacher.kycStatus !== 'verified' && onKycUpdate && (
                          <DropdownMenuItem
                            className="gap-2 text-success focus:text-success"
                            onSelect={() => {
                              onKycUpdate(user?.id || '', 'verified');
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" /> Verify KYC
                          </DropdownMenuItem>
                        )}
                        {teacher.kycStatus !== 'rejected' && onKycUpdate && (
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onSelect={() => {
                              onKycUpdate(user?.id || '', 'rejected');
                            }}
                          >
                            <XCircle className="h-4 w-4" /> Reject KYC
                          </DropdownMenuItem>
                        )}
                      </PermissionGate>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

