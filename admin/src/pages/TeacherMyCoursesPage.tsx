import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, XCircle, Clock, Plus, Video, ExternalLink, LogOut } from 'lucide-react';
import { TeacherCourseJoinAPI, ApiTeacherCourse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

const TeacherMyCoursesPage = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [teacherCourses, setTeacherCourses] = useState<ApiTeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [exitingId, setExitingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (currentRole !== 'teacher') {
      navigate('/');
      return;
    }
    loadMyCourses();
  }, [currentRole, filterStatus]);

  const loadMyCourses = async () => {
    setLoading(true);
    try {
      const status = filterStatus !== 'all' ? filterStatus : undefined;
      const data = await TeacherCourseJoinAPI.getMyCourses(status);
      setTeacherCourses(data.teacherCourses || []);
    } catch (err: any) {
      toast({ title: 'Failed to load courses', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (course: ApiTeacherCourse['courseId']) => {
    if (typeof course === 'string') return 'Unknown';
    return course.name || 'Unknown';
  };

  const getLanguageNames = (languages: ApiTeacherCourse['languageIds']) => {
    if (!Array.isArray(languages)) return 'Unknown';
    return languages.map(lang => {
      if (typeof lang === 'string') return 'Unknown';
      return lang.name || lang.code || 'Unknown';
    }).join(', ');
  };

  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/20 text-warning border-warning/30',
    approved: 'bg-success/20 text-success border-success/30',
    rejected: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
  };

  const handleExitCourse = async (id: string) => {
    const confirmed = await confirm({
      title: 'Exit Course',
      description: 'Are you sure you want to exit from this course? This action cannot be undone.',
      confirmText: 'Exit',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }

    setExitingId(id);
    try {
      await TeacherCourseJoinAPI.exitCourse(id);
      toast({ 
        title: 'Success', 
        description: 'Successfully exited from the course' 
      });
      loadMyCourses(); // Reload the list
    } catch (err: any) {
      toast({ 
        title: 'Failed to exit course', 
        description: err?.message, 
        variant: 'destructive' 
      });
    } finally {
      setExitingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Course Requests</h1>
            <p className="mt-1 text-muted-foreground">
              View the status of your course join requests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => navigate('/teacher/join-course')}>
              <Plus className="h-4 w-4 mr-2" />
              Join New Course
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : teacherCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No course requests found</p>
              <Button onClick={() => navigate('/teacher/join-course')}>
                <Plus className="h-4 w-4 mr-2" />
                Join a Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden animate-slide-up">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Course</TableHead>
                  <TableHead className="text-muted-foreground">Languages</TableHead>
                  <TableHead className="text-muted-foreground">Price</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Requested</TableHead>
                  <TableHead className="text-muted-foreground">Reviewed</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherCourses.map((request) => {
                  const StatusIcon = statusIcons[request.status] || Clock;
                  const course = typeof request.courseId === 'string' ? null : request.courseId;
                  return (
                    <TableRow key={request._id} className="border-border transition-colors hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {course?.image && (
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                              <img
                                src={course.image}
                                alt={getCourseName(request.courseId)}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{getCourseName(request.courseId)}</p>
                            {request.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{request.bio}</p>
                            )}
                            {request.introductionVideo && (
                              <a
                                href={request.introductionVideo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              >
                                <Video className="h-3 w-3" />
                                Watch Introduction Video
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(request.languageIds) ? (
                            request.languageIds.map((lang, idx) => {
                              const langName = typeof lang === 'string' ? 'Unknown' : (lang.name || lang.code || 'Unknown');
                              return (
                                <Badge key={idx} variant="outline">{langName}</Badge>
                              );
                            })
                          ) : (
                            <Badge variant="outline">Unknown</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {request.currency} {request.price}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('border capitalize flex items-center gap-1 w-fit', statusStyles[request.status] || 'bg-muted')}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.reviewedAt ? (
                          <div>
                            <div>{new Date(request.reviewedAt).toLocaleDateString()}</div>
                            {request.rejectionReason && (
                              <div className="text-xs text-destructive mt-1 italic">
                                {request.rejectionReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExitCourse(request._id)}
                          disabled={exitingId === request._id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          {exitingId === request._id ? 'Exiting...' : 'Exit'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </AdminLayout>
  );
};

export default TeacherMyCoursesPage;


