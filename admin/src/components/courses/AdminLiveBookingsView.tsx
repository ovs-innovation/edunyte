import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  Radio,
  ExternalLink,
  Copy,
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";
import { BookingAPI, ApiBooking } from "@/lib/api";
import { getLanguageValue } from "@/lib/languageHelper";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function AdminLiveBookingsView() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<ApiBooking | null>(null);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [meetingFormData, setMeetingFormData] = useState({
    meetingType: "google_meet" as "google_meet" | "zoom" | "teams" | "custom",
    meetingUrl: "",
    meetingId: "",
  });

  const { toast } = useToast();

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== "all" ? { status: filterStatus as any } : undefined;
      const res = await BookingAPI.getAdminLiveBookings(params);
      setBookings(res.bookings || []);
    } catch (err: any) {
      toast({
        title: "Failed to load live sessions",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filterStatus]);

  const handleOpenEditMeeting = (booking: ApiBooking) => {
    setSelectedBooking(booking);
    setMeetingFormData({
      meetingType: (booking.meetingType as any) || "google_meet",
      meetingUrl: booking.meetingUrl || booking.meeting?.joinUrlStudent || "",
      meetingId: booking.meetingId || booking.meeting?.meetingId || "",
    });
    setMeetingDialogOpen(true);
  };

  const handleSaveMeeting = async () => {
    if (!selectedBooking) return;
    try {
      await BookingAPI.adminUpdateMeetingDetails(selectedBooking._id, meetingFormData);
      toast({
        title: "Google Meet link updated successfully",
        description: "Enrolled student and teacher can now access this Google Meet link.",
      });
      setMeetingDialogOpen(false);
      setSelectedBooking(null);
      await loadBookings();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Google Meet link copied!",
      description: text,
    });
  };

  const filteredBookings = bookings.filter((b) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const studentName = typeof b.studentId === "object" ? (b.studentId as any)?.name || "" : "";
    const teacherName = typeof b.teacherId === "object" ? (b.teacherId as any)?.name || "" : "";
    const courseName = typeof b.courseId === "object" ? getLanguageValue((b.courseId as any)?.name) : "";
    return (
      studentName.toLowerCase().includes(term) ||
      teacherName.toLowerCase().includes(term) ||
      courseName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student, teacher, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={loadBookings}
            disabled={loading}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs">Session Date & Time</TableHead>
              <TableHead className="text-xs">Course</TableHead>
              <TableHead className="text-xs">Student</TableHead>
              <TableHead className="text-xs">Teacher</TableHead>
              <TableHead className="text-xs">Google Meet / Live Link</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                  Loading live booking sessions...
                </TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                  No live booking sessions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => {
                const sessionDate = booking.sessionDate ? new Date(booking.sessionDate) : new Date();
                const student = typeof booking.studentId === "object" ? (booking.studentId as any) : null;
                const teacher = typeof booking.teacherId === "object" ? (booking.teacherId as any) : null;
                const course = typeof booking.courseId === "object" ? (booking.courseId as any) : null;
                const activeMeetUrl = booking.meetingUrl || booking.meeting?.joinUrlStudent || "";
                const isGoogleMeet = booking.meetingType === "google_meet" || activeMeetUrl.includes("meet.google.com");

                return (
                  <TableRow key={booking._id} className="hover:bg-muted/30">
                    <TableCell className="text-xs">
                      <div className="font-medium text-foreground">
                        {format(sessionDate, "MMM d, yyyy")}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.startTime || "N/A"} ({booking.duration || 60}m)
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-medium">
                      {course ? getLanguageValue(course.name) : "Course Session"}
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-medium text-foreground">{student?.name || "Student"}</div>
                      <div className="text-[11px] text-muted-foreground">{student?.email}</div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-medium text-foreground">{teacher?.name || "Teacher"}</div>
                      <div className="text-[11px] text-muted-foreground">{teacher?.email}</div>
                    </TableCell>

                    <TableCell className="text-xs">
                      {activeMeetUrl ? (
                        <div className="flex items-center gap-1.5 max-w-[200px]">
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${
                              isGoogleMeet
                                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                                : "text-primary border-primary/30"
                            }`}
                          >
                            {isGoogleMeet ? "Google Meet" : "Zoom"}
                          </Badge>
                          <span className="truncate font-mono text-[11px] text-muted-foreground">
                            {activeMeetUrl}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No link assigned</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs">
                      <Badge
                        variant={
                          booking.status === "completed"
                            ? "default"
                            : booking.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px] capitalize"
                      >
                        {booking.status || "scheduled"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        {activeMeetUrl && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(activeMeetUrl)}
                              title="Copy Google Meet Link"
                              className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(activeMeetUrl, "_blank")}
                              title="Join Call"
                              className="h-7 w-7 text-primary hover:bg-primary/10"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditMeeting(booking)}
                          className="h-7 text-xs gap-1 border-primary/40 hover:bg-primary/10"
                        >
                          <Radio className="h-3 w-3 text-emerald-500" />
                          Set Google Meet
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Google Meet Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-500" />
              Set Google Meet Link for Session
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign or update the live meeting link for this session. It will immediately appear in the student & teacher dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="text-xs">
                <span className="font-semibold text-foreground">Need a new Google Meet?</span>
                <p className="text-[11px] text-muted-foreground">Create a fresh call in 1 click.</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => window.open("https://meet.google.com/new", "_blank")}
                className="h-7 gap-1 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <ExternalLink className="h-3 w-3" />
                meet.google.com/new
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-meeting-url" className="text-xs font-medium">
                Google Meet Link
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-meeting-url"
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  className="pl-9 font-mono text-xs"
                  value={meetingFormData.meetingUrl}
                  onChange={(e) =>
                    setMeetingFormData({ ...meetingFormData, meetingUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-meeting-type" className="text-xs font-medium">
                Platform
              </Label>
              <Select
                value={meetingFormData.meetingType}
                onValueChange={(val: any) =>
                  setMeetingFormData({ ...meetingFormData, meetingType: val })
                }
              >
                <SelectTrigger id="admin-meeting-type" className="text-xs">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_meet">Google Meet (Recommended)</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="custom">Custom Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMeetingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveMeeting}
              className="gradient-primary text-white shadow-glow"
            >
              Save Meeting Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
