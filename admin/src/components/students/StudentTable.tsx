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
import { MoreHorizontal, Pencil, Eye, Award } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ApiStudentProfile, ApiUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Props {
  students: Array<ApiStudentProfile & { userId: ApiUser }>;
  loading: boolean;
  onEdit: (profile: ApiStudentProfile & { userId: ApiUser }) => void;
  onView: (profile: ApiStudentProfile & { userId: ApiUser }) => void;
}

export function StudentTable({ students, loading, onEdit, onView }: Props) {
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
            <TableHead className="text-muted-foreground">Student</TableHead>
            <TableHead className="text-muted-foreground">Country</TableHead>
            <TableHead className="text-muted-foreground">Courses</TableHead>
            <TableHead className="text-muted-foreground">Lessons Booked</TableHead>
            <TableHead className="text-muted-foreground">Lessons Completed</TableHead>
            <TableHead className="text-muted-foreground">Completion %</TableHead>
            <TableHead className="text-muted-foreground">Hours Spent</TableHead>
            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading && students.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No students found
              </TableCell>
            </TableRow>
          )}
          {students.map((student, index) => {
            const user = typeof student.userId === 'object' ? student.userId : null;
            const progress = student.progress || {
              totalCourses: 0,
              totalHoursSpent: 0,
              totalLessonsBooked: 0,
              totalLessonsCompleted: 0,
            };
            const completionPercentage = progress.totalLessonsBooked > 0 
              ? Math.round((progress.totalLessonsCompleted / progress.totalLessonsBooked) * 100) 
              : 0;

            return (
              <TableRow
                key={student._id}
                className="border-border transition-colors hover:bg-muted/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {formatAvatar(user?.name || 'S')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user?.name || '—'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || '—'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {student.country || '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium">
                    {progress.totalCourses}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-medium">
                   {progress.totalLessonsBooked}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                    {progress.totalLessonsCompleted}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-20">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${completionPercentage}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {completionPercentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {progress.totalHoursSpent}h
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="gap-2" onSelect={() => onView(student)}>
                        <Eye className="h-4 w-4" /> View
                      </DropdownMenuItem>
                      <PermissionGate permission="students.edit">
                        <DropdownMenuItem className="gap-2" onSelect={() => onEdit(student)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
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

