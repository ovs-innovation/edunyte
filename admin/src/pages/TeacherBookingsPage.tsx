import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, User, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { BookingAPI, ApiBooking } from '@/lib/api';
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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const TeacherBookingsPage = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled' | 'no_show'>('all');
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ApiBooking | null>(null);
  const [meetingFormData, setMeetingFormData] = useState({
    meetingType: 'zoom' as 'zoom' | 'google_meet' | 'teams' | 'custom',
    meetingUrl: '',
    meetingId: '',
    meetingPassword: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (currentRole !== 'teacher') {
      navigate('/');
      return;
    }
    loadBookings();
  }, [currentRole, filterStatus]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const status = filterStatus !== 'all' ? filterStatus : undefined;
      const data = await BookingAPI.getTeacherBookings({ status });
      setBookings(data.bookings || []);
    } catch (err: any) {
      toast({ title: 'Failed to load bookings', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMeetingDialog = (booking: ApiBooking) => {
    setSelectedBooking(booking);
    setMeetingFormData({
      meetingType: booking.meetingType || 'zoom',
      meetingUrl: booking.meetingUrl || '',
      meetingId: booking.meetingId || '',
      meetingPassword: booking.meetingPassword || '',
    });
    setMeetingDialogOpen(true);
  };

  const handleUpdateMeeting = async () => {
    if (!selectedBooking) return;
    try {
      await BookingAPI.updateMeetingDetails(selectedBooking._id, meetingFormData);
      toast({ title: 'Meeting details updated successfully' });
      setMeetingDialogOpen(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
    }
  };

  const handleUpdateStatus = async (id: string, status: 'completed' | 'cancelled' | 'no_show') => {
    try {
      await BookingAPI.updateTeacherStatus(id, { status, teacherNotes: '' });
      toast({ title: 'Booking status updated successfully' });
      loadBookings();
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
    }
  };

  const getStudentName = (student: ApiBooking['studentId']) => {
    if (typeof student === 'string') return 'Unknown';
    return student.name || student.email || 'Unknown';
  };

  const getCourseName = (course: ApiBooking['courseId']) => {
    if (typeof course === 'string') return 'Unknown';
    return getLanguageValue(course.name) || 'Unknown';
  };

  const statusStyles: Record<string, string> = {
    scheduled: 'bg-primary/20 text-primary border-primary/30',
    completed: 'bg-success/20 text-success border-success/30',
    cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
    no_show: 'bg-warning/20 text-warning border-warning/30',
  };

  const paymentStatusStyles: Record<string, string> = {
    pending: 'bg-warning/20 text-warning border-warning/30',
    paid: 'bg-success/20 text-success border-success/30',
    failed: 'bg-destructive/20 text-destructive border-destructive/30',
    refunded: 'bg-muted text-muted-foreground border-muted',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your scheduled sessions with students.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden animate-slide-up">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Student</TableHead>
                  <TableHead className="text-muted-foreground">Course</TableHead>
                  <TableHead className="text-muted-foreground">Date & Time</TableHead>
                  <TableHead className="text-muted-foreground">Students</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Payment</TableHead>
                  <TableHead className="text-muted-foreground">Meeting</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id} className="border-border transition-colors hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{getStudentName(booking.studentId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getCourseName(booking.courseId)}</p>
                        <p className="text-xs text-muted-foreground">{booking.duration} mins</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(booking.sessionDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {booking.startTime} - {booking.endTime} ({booking.timezone})
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{(booking as any).studentCount || 1}</span>
                        <span className="text-xs text-muted-foreground">
                          {(booking as any).studentCount === 1 ? 'student' : 'students'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('border capitalize', statusStyles[booking.status] || 'bg-muted')}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('border capitalize', paymentStatusStyles[booking.paymentStatus] || 'bg-muted')}
                      >
                        {booking.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.meeting?.joinUrlTeacher ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(booking.meeting?.joinUrlTeacher, '_blank')}
                          className="gap-2"
                        >
                          <Video className="h-4 w-4" />
                          <ExternalLink className="h-3 w-3" />
                          Join Meeting
                        </Button>
                      ) : booking.meetingUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(booking.meetingUrl, '_blank')}
                          className="gap-2"
                        >
                          <Video className="h-4 w-4" />
                          Join
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMeetingDialog(booking)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Add Link
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'scheduled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-success"
                              onClick={() => handleUpdateStatus(booking._id, 'completed')}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-destructive"
                              onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Meeting Details Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Meeting Details</DialogTitle>
            <DialogDescription>
              Add or update meeting link for this session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meetingType">Meeting Type</Label>
              <Select
                value={meetingFormData.meetingType}
                onValueChange={(value) => setMeetingFormData({ ...meetingFormData, meetingType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="custom">Custom URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingUrl">Meeting URL *</Label>
              <Input
                id="meetingUrl"
                type="url"
                value={meetingFormData.meetingUrl}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, meetingUrl: e.target.value })}
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meetingId">Meeting ID</Label>
                <Input
                  id="meetingId"
                  value={meetingFormData.meetingId}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, meetingId: e.target.value })}
                  placeholder="123 456 7890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingPassword">Password</Label>
                <Input
                  id="meetingPassword"
                  value={meetingFormData.meetingPassword}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, meetingPassword: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMeeting} disabled={!meetingFormData.meetingUrl}>
              Update Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default TeacherBookingsPage;

