import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Download, Filter, CheckCircle2, XCircle, Video, ExternalLink } from 'lucide-react';
import { TeacherCoursesAPI, ApiTeacherCourse, CoursesAPI, LanguagesAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getLanguageValue } from '@/lib/languageHelper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Badge } from '@/components/ui/badge';

const PROFICIENCY_LEVELS = [
  { value: 'native', label: 'Native' },
  { value: 'c2', label: 'Proficient C2' },
  { value: 'c1', label: 'Advanced C1' },
  { value: 'b2', label: 'Upper Intermediate B2' },
  { value: 'b1', label: 'Intermediate B1' },
  { value: 'a2', label: 'Elementary A2' },
  { value: 'a1', label: 'Beginner A1' },
] as const;

type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number]['value'];

const PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = PROFICIENCY_LEVELS.reduce(
  (acc, level) => {
    acc[level.value] = level.label;
    return acc;
  },
  {} as Record<ProficiencyLevel, string>
);

const getProficiencyLabel = (value?: string) => {
  if (!value) return '';
  const key = value.toLowerCase() as ProficiencyLevel;
  return PROFICIENCY_LABELS[key] || value.toUpperCase();
};

const TeacherApprovalPage = () => {
  const [teacherCourses, setTeacherCourses] = useState<ApiTeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApiTeacherCourse | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const data = await TeacherCoursesAPI.list(params);
      setTeacherCourses(data.teacherCourses || []);
    } catch (err: any) {
      toast({ title: 'Failed to load requests', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  const handleApprove = async (id: string) => {
    const confirmed = await confirm({
      title: 'Approve Request',
      description: 'Are you sure you want to approve this request?',
      confirmText: 'Approve',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await TeacherCoursesAPI.approve(id);
      toast({ title: 'Request approved successfully' });
      loadRequests();
    } catch (err: any) {
      toast({ title: 'Approval failed', description: err?.message, variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      await TeacherCoursesAPI.reject(selectedRequest._id, rejectionReason);
      toast({ title: 'Request rejected successfully' });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
      loadRequests();
    } catch (err: any) {
      toast({ title: 'Rejection failed', description: err?.message, variant: 'destructive' });
    }
  };

  const openRejectDialog = (request: ApiTeacherCourse) => {
    setSelectedRequest(request);
    setRejectionReason(request.rejectionReason || '');
    setRejectDialogOpen(true);
  };

  const getTeacherName = (teacher: ApiTeacherCourse['teacherId']) => {
    if (typeof teacher === 'string') return 'Unknown';
    return teacher.name || teacher.email || 'Unknown';
  };

  const getCourseName = (course: ApiTeacherCourse['courseId']) => {
    if (typeof course === 'string') return 'Unknown';
    return getLanguageValue(course.name) || 'Unknown';
  };

  const getTeacherBio = (teacherCourse: ApiTeacherCourse) => {
    // Bio comes from teacher profile, not from teacherCourse
    return teacherCourse.bio || '';
  };

  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/20 text-warning border-warning/30',
    approved: 'bg-success/20 text-success border-success/30',
    rejected: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Teacher Course Requests</h1>
            <p className="mt-1 text-muted-foreground">
              Review and approve/reject teacher requests to join courses.
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
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <PermissionGate permission="reports.export">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden animate-slide-up">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Teacher</TableHead>
                <TableHead className="text-muted-foreground">Course</TableHead>
                <TableHead className="text-muted-foreground">Language</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Requested</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading && teacherCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No requests found
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                teacherCourses.map((request) => (
                  <TableRow key={request._id} className="border-border transition-colors hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{getTeacherName(request.teacherId)}</p>
                        <p className="text-xs text-muted-foreground">
                          Price: {typeof request.currency === 'string' ? request.currency : 'USD'} {typeof request.price === 'number' ? request.price.toFixed(2) : String(request.price || '0.00')} | Timezone: {request.timezone || 'UTC'}
                        </p>
                        {request.experience && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            <strong>Experience:</strong> {String(getLanguageValue(request.experience) || '')}
                          </p>
                        )}
                        {request.bio && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            <strong>Bio:</strong> {String(getLanguageValue(request.bio) || '')}
                          </p>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {typeof request.courseId !== 'string' && request.courseId?.image && (
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <img
                              src={request.courseId.image}
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
                          {typeof request.courseId !== 'string' && request.courseId?.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {String(getLanguageValue(request.courseId.description) || '')}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray((request as any).languages) && (request as any).languages.length > 0 ? (
                          (request as any).languages.map(
                            (
                              lang: {
                                code?: string;
                                name?: string;
                                proficiency?: string;
                              },
                              idx: number
                            ) => {
                              const displayName = lang.name || lang.code || 'Unknown';
                              const profLabel = getProficiencyLabel(lang.proficiency);
                              return (
                                <Badge key={idx} variant="outline">
                                  {displayName}
                                  {profLabel ? ` (${profLabel})` : ''}
                                </Badge>
                              );
                            }
                          )
                        ) : Array.isArray(request.languageIds) ? (
                          request.languageIds.map((lang, idx) => {
                            const langName =
                              typeof lang === 'string'
                                ? 'Unknown'
                                : getLanguageValue(lang.name) || lang.code || 'Unknown';
                            return (
                              <Badge key={idx} variant="outline">
                                {langName}
                              </Badge>
                            );
                          })
                        ) : (
                          <Badge variant="outline">Unknown</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {typeof request.currency === 'string' ? request.currency : 'USD'} {typeof request.price === 'number' ? request.price.toFixed(2) : String(request.price || '0.00')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('border capitalize', statusStyles[request.status] || 'bg-muted')}
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {request.status === 'pending' && (
                          <>
                            <PermissionGate permission="teacher_courses.approve">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-success border-success hover:bg-success/10"
                                onClick={() => handleApprove(request._id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => openRejectDialog(request)}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </PermissionGate>
                          </>
                        )}
                        {request.status === 'rejected' && request.rejectionReason && (
                          <span className="text-sm text-muted-foreground italic">
                            {request.rejectionReason}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this teacher course request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setSelectedRequest(null);
              setRejectionReason('');
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </AdminLayout>
  );
};

export default TeacherApprovalPage;


