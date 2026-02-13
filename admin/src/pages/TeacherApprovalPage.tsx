import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Download, Filter, CheckCircle2, XCircle, Video, ExternalLink, Edit, DollarSign, RefreshCw } from 'lucide-react';
import { TeacherCoursesAPI, ApiTeacherCourse, CoursesAPI, LanguagesAPI, SettingsAPI, ApiSettings } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getLanguageValue } from '@/lib/languageHelper';
import { Input } from '@/components/ui/input';
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
  const [settings, setSettings] = useState<ApiSettings | null>(null);
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(4);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [tempFeePercent, setTempFeePercent] = useState<number>(4);
  const [customFeeDialogOpen, setCustomFeeDialogOpen] = useState(false);
  const [selectedCourseForFee, setSelectedCourseForFee] = useState<ApiTeacherCourse | null>(null);
  const [tempCustomFeePercent, setTempCustomFeePercent] = useState<number>(4);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const loadSettings = async () => {
    try {
      const data = await SettingsAPI.get();
      setSettings(data.settings);
      const fee = data.settings.platformFeePercent ?? 4;
      setPlatformFeePercent(fee);
      setTempFeePercent(fee);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    }
  };

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
    loadSettings();
    loadRequests();
  }, [filterStatus]);

  // Reload settings when window regains focus (e.g., after updating settings on another page)
  useEffect(() => {
    const handleFocus = () => {
      loadSettings();
      loadRequests();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleUpdatePlatformFee = async () => {
    if (!settings) return;
    try {
      const data = await SettingsAPI.update({ platformFeePercent: tempFeePercent });
      setSettings(data.settings);
      setPlatformFeePercent(tempFeePercent);
      setFeeDialogOpen(false);
      toast({ title: 'Platform fee updated successfully' });
    } catch (err: any) {
      toast({ title: 'Failed to update platform fee', description: err?.message, variant: 'destructive' });
    }
  };

  const getCourseFeePercent = (course: ApiTeacherCourse): number => {
    // Check if course has a custom platform fee percentage
    return (course as any).customPlatformFeePercent ?? platformFeePercent;
  };

  const calculatePlatformFee = (teacherPrice: number, customPercent?: number) => {
    const feePercent = customPercent ?? platformFeePercent;
    return (teacherPrice * feePercent) / 100;
  };

  const calculateTotalPrice = (teacherPrice: number, customPercent?: number) => {
    return teacherPrice + calculatePlatformFee(teacherPrice, customPercent);
  };

  const openCustomFeeDialog = (course: ApiTeacherCourse) => {
    setSelectedCourseForFee(course);
    const currentFee = getCourseFeePercent(course);
    setTempCustomFeePercent(currentFee);
    setCustomFeeDialogOpen(true);
  };

  const handleUpdateCustomFee = async () => {
    if (!selectedCourseForFee) return;
    try {
      // Update the teacher course with custom platform fee
      await TeacherCoursesAPI.update(selectedCourseForFee._id, {
        customPlatformFeePercent: tempCustomFeePercent
      });
      toast({ title: 'Custom platform fee updated successfully' });
      setCustomFeeDialogOpen(false);
      setSelectedCourseForFee(null);
      loadRequests(); // Reload to show updated data
    } catch (err: any) {
      toast({ title: 'Failed to update custom fee', description: err?.message, variant: 'destructive' });
    }
  };

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

        {/* Platform Fee Info Card */}
        <div className="rounded-xl border border-border bg-card p-4 animate-slide-up flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Platform Fee Percentage</p>
              <p className="text-xs text-muted-foreground">
                Current processing fee: <span className="font-semibold">{platformFeePercent}%</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                loadSettings();
                loadRequests();
              }}
              title="Refresh settings"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <PermissionGate permission="settings.edit">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setFeeDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
                Edit Fee
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
                          Price: {request?.pricing?.teacherCurrency || 'USD'}{' '}
                          {typeof request?.pricing?.teacherPrice === 'number'
                            ? request.pricing.teacherPrice.toFixed(2)
                            : '0.00'}{' '}
                          | Timezone: {request.timezone || 'UTC'}
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
                      <div className="flex items-center gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="font-medium text-foreground">
                            {request?.pricing?.teacherCurrency || 'USD'}{' '}
                            {typeof request?.pricing?.teacherPrice === 'number'
                              ? calculateTotalPrice(request.pricing.teacherPrice, getCourseFeePercent(request)).toFixed(2)
                              : '0.00'}
                          </div>
                          {typeof request?.pricing?.teacherPrice === 'number' && (
                            <>
                              <div className="text-xs text-muted-foreground">
                                Teacher: {request?.pricing?.teacherCurrency || 'USD'} {request.pricing.teacherPrice.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Fee ({getCourseFeePercent(request)}%): {request?.pricing?.teacherCurrency || 'USD'}{' '}
                                {calculatePlatformFee(request.pricing.teacherPrice, getCourseFeePercent(request)).toFixed(2)}
                                {(request as any).customPlatformFeePercent !== undefined && (
                                  <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Custom</Badge>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <PermissionGate permission="settings.edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openCustomFeeDialog(request)}
                            title="Edit platform fee for this course"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGate>
                      </div>
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

      {/* Platform Fee Edit Dialog */}
      <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Platform Fee</DialogTitle>
            <DialogDescription>
              Update the platform processing fee percentage applied to all teacher course bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="platformFeePercent">Platform Fee Percentage (%)</Label>
              <Input
                id="platformFeePercent"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={tempFeePercent}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 100) {
                    setTempFeePercent(value);
                  }
                }}
                placeholder="4.0"
              />
              <p className="text-xs text-muted-foreground">
                The percentage fee charged on top of the teacher's price. Current: {platformFeePercent}%
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFeeDialogOpen(false);
                setTempFeePercent(platformFeePercent);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePlatformFee}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Platform Fee Edit Dialog */}
      <Dialog open={customFeeDialogOpen} onOpenChange={setCustomFeeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Platform Fee for Course</DialogTitle>
            <DialogDescription>
              Set a custom platform fee percentage for this specific teacher course, or use the global default ({platformFeePercent}%).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customFeePercent">Platform Fee Percentage (%)</Label>
              <Input
                id="customFeePercent"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={tempCustomFeePercent}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 100) {
                    setTempCustomFeePercent(value);
                  }
                }}
                placeholder={`${platformFeePercent}`}
              />
              <p className="text-xs text-muted-foreground">
                Global default: {platformFeePercent}% • Current custom: {selectedCourseForFee && getCourseFeePercent(selectedCourseForFee)}%
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCustomFeeDialogOpen(false);
                setSelectedCourseForFee(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => setTempCustomFeePercent(platformFeePercent)}
            >
              Use Global ({platformFeePercent}%)
            </Button>
            <Button onClick={handleUpdateCustomFee}>
              Save Custom Fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </AdminLayout>
  );
};

export default TeacherApprovalPage;


