import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Play,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Clock,
  Calendar,
  Eye,
  CheckCircle2,
  Layers,
  Sparkles,
  Link as LinkIcon,
  VideoOff,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { CloudinaryVideoUploader } from "./CloudinaryVideoUploader";
import { LecturesAPI, ApiLecture, ApiCourse } from "@/lib/api";
import { getLanguageValue } from "@/lib/languageHelper";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { format } from "date-fns";

interface ManageLecturesDialogProps {
  course: ApiCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLecturesUpdated?: () => void;
}

export function ManageLecturesDialog({
  course,
  open,
  onOpenChange,
  onLecturesUpdated,
}: ManageLecturesDialogProps) {
  const [lectures, setLectures] = useState<ApiLecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "recorded" | "live">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<ApiLecture | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    section: "General",
    description: "",
    type: "recorded" as "recorded" | "live",
    videoUrl: "",
    videoPublicId: "",
    videoDuration: 0,
    googleMeetUrl: "",
    meetingId: "",
    scheduledAt: "",
    duration: 60,
    liveStatus: "scheduled" as "scheduled" | "live" | "completed" | "cancelled",
    isPreview: false,
    status: "active" as "active" | "draft" | "archived",
  });

  const courseTitle = course ? getLanguageValue(course.name) : "Course";

  const loadLectures = async () => {
    if (!course?._id) return;
    try {
      setLoading(true);
      const res = await LecturesAPI.listByCourse(course._id);
      setLectures(res.lectures || []);
    } catch (err: any) {
      toast({
        title: "Failed to load lectures",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && course?._id) {
      loadLectures();
      setFormOpen(false);
      setEditingLecture(null);
    }
  }, [open, course?._id]);

  const resetForm = () => {
    setFormData({
      title: "",
      section: "General",
      description: "",
      type: "recorded",
      videoUrl: "",
      videoPublicId: "",
      videoDuration: 0,
      googleMeetUrl: "",
      meetingId: "",
      scheduledAt: "",
      duration: 60,
      liveStatus: "scheduled",
      isPreview: false,
      status: "active",
    });
    setEditingLecture(null);
  };

  const handleOpenCreate = (defaultType: "recorded" | "live" = "recorded") => {
    resetForm();
    setFormData((prev) => ({ ...prev, type: defaultType }));
    setFormOpen(true);
  };

  const handleOpenEdit = (lecture: ApiLecture) => {
    setEditingLecture(lecture);
    setFormData({
      title: getLanguageValue(lecture.title),
      section: lecture.section || "General",
      description: getLanguageValue(lecture.description) || "",
      type: lecture.type || "recorded",
      videoUrl: lecture.videoUrl || "",
      videoPublicId: lecture.videoPublicId || "",
      videoDuration: lecture.videoDuration || 0,
      googleMeetUrl: lecture.liveMeeting?.meetingUrl || "",
      meetingId: lecture.liveMeeting?.meetingId || "",
      scheduledAt: lecture.liveMeeting?.scheduledAt
        ? new Date(lecture.liveMeeting.scheduledAt).toISOString().slice(0, 16)
        : "",
      duration: lecture.liveMeeting?.duration || 60,
      liveStatus: lecture.liveMeeting?.status || "scheduled",
      isPreview: lecture.isPreview || false,
      status: lecture.status || "active",
    });
    setFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course?._id) return;

    if (!formData.title.trim()) {
      toast({
        title: "Lecture title is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "recorded" && !formData.videoUrl) {
      toast({
        title: "Video is required",
        description: "Please upload a video file for this recorded lecture.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "live" && !formData.googleMeetUrl) {
      toast({
        title: "Google Meet link required",
        description: "Please provide a Google Meet link for the live class.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: Partial<ApiLecture> = {
        title: formData.title.trim(),
        section: formData.section.trim() || "General",
        description: formData.description.trim(),
        type: formData.type,
        videoUrl: formData.type === "recorded" ? formData.videoUrl : "",
        videoPublicId: formData.type === "recorded" ? formData.videoPublicId : "",
        videoDuration: formData.type === "recorded" ? Number(formData.videoDuration) || 0 : 0,
        liveMeeting:
          formData.type === "live"
            ? {
                provider: "google_meet",
                meetingUrl: formData.googleMeetUrl.trim(),
                meetingId: formData.meetingId.trim(),
                scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
                duration: Number(formData.duration) || 60,
                status: formData.liveStatus,
              }
            : undefined,
        isPreview: formData.isPreview,
        status: formData.status,
      };

      if (editingLecture) {
        await LecturesAPI.update(editingLecture._id, payload);
        toast({ title: "Lecture updated successfully" });
      } else {
        await LecturesAPI.create(course._id, payload);
        toast({ title: "Lecture created successfully" });
      }

      setFormOpen(false);
      resetForm();
      await loadLectures();
      onLecturesUpdated?.();
    } catch (err: any) {
      toast({
        title: "Operation failed",
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (lectureId: string) => {
    const ok = await confirm({
      title: "Delete Lecture",
      description: "Are you sure you want to delete this lecture? Any uploaded video assets will be removed.",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await LecturesAPI.delete(lectureId);
      toast({ title: "Lecture deleted successfully" });
      await loadLectures();
      onLecturesUpdated?.();
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string = "Link") => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied to clipboard!`,
      description: text,
    });
  };

  const filteredLectures = lectures.filter((l) => {
    if (filterType === "all") return true;
    return l.type === filterType;
  });

  const recordedCount = lectures.filter((l) => l.type === "recorded").length;
  const liveCount = lectures.filter((l) => l.type === "live").length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-primary border-primary/30">
                    Course Curriculum
                  </Badge>
                  <span className="text-xs text-muted-foreground">ID: {course?._id}</span>
                </div>
                <DialogTitle className="mt-1 text-xl font-bold tracking-tight text-foreground">
                  {courseTitle}
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-muted-foreground">
                  Upload video lectures to Cloudinary and schedule live Google Meet classes.
                </DialogDescription>
              </div>

              {!formOpen && (
                <div className="flex items-center gap-2.5">
                  <Button
                    onClick={() => handleOpenCreate("recorded")}
                    className="gap-2 px-5 py-2 text-sm font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-md shadow-cyan-500/30 border border-cyan-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Video className="h-4 w-4 stroke-[2.5]" />
                    Upload Lecture
                  </Button>
                  <Button
                    onClick={() => handleOpenCreate("live")}
                    variant="outline"
                    className="gap-2 px-4 py-2 text-sm font-semibold border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 shadow-sm"
                  >
                    <Radio className="h-4 w-4 text-emerald-400" />
                    Schedule Live Class
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-center">
                <span className="text-xs text-muted-foreground">Total Lectures</span>
                <p className="text-lg font-bold text-foreground">{lectures.length}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-primary/5 p-2.5 text-center">
                <span className="text-xs text-primary font-medium">Recorded Videos</span>
                <p className="text-lg font-bold text-primary">{recordedCount}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-emerald-500/5 p-2.5 text-center">
                <span className="text-xs text-emerald-500 font-medium">Live Classes</span>
                <p className="text-lg font-bold text-emerald-500">{liveCount}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Form Modal for Creating/Editing */}
          {formOpen ? (
            <form onSubmit={handleSubmitForm} className="space-y-6 pt-4 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  {editingLecture ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                  {editingLecture ? "Edit Lecture" : "Add New Lecture"}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "recorded" })}
                  className={`flex items-center justify-center gap-2.5 rounded-xl border p-4 text-sm font-semibold transition-all ${
                    formData.type === "recorded"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Video className="h-5 w-5" />
                  <span>Recorded Video Lecture</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "live" })}
                  className={`flex items-center justify-center gap-2.5 rounded-xl border p-4 text-sm font-semibold transition-all ${
                    formData.type === "live"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Radio className="h-5 w-5" />
                  <span>Live Class (Google Meet)</span>
                </button>
              </div>

              {/* General Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="lecture-title" className="text-xs font-medium">
                    Lecture Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lecture-title"
                    placeholder="e.g. Introduction to Variables & Functions"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lecture-section" className="text-xs font-medium">
                    Section / Chapter Name
                  </Label>
                  <Input
                    id="lecture-section"
                    placeholder="e.g. Module 1: Basics"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lecture-status" className="text-xs font-medium">
                    Publish Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger id="lecture-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Published)</SelectItem>
                      <SelectItem value="draft">Draft (Hidden)</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="lecture-desc" className="text-xs font-medium">
                    Description & Overview
                  </Label>
                  <Textarea
                    id="lecture-desc"
                    placeholder="Provide a brief summary or key takeaways for this lecture..."
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Type-Specific Fields */}
              {formData.type === "recorded" ? (
                /* RECORDED VIDEO SECTION */
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">
                        Upload Lecture Video (Cloudinary)
                      </h4>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Auto Cloudinary Processing
                    </Badge>
                  </div>

                  <CloudinaryVideoUploader
                    courseId={course?._id || ""}
                    videoUrl={formData.videoUrl}
                    videoDuration={formData.videoDuration}
                    videoPublicId={formData.videoPublicId}
                    onVideoUploaded={(data) => {
                      setFormData((prev) => ({
                        ...prev,
                        videoUrl: data.videoUrl,
                        videoPublicId: data.videoPublicId,
                        videoDuration: data.videoDuration,
                      }));
                    }}
                    onVideoRemoved={() => {
                      setFormData((prev) => ({
                        ...prev,
                        videoUrl: "",
                        videoPublicId: "",
                        videoDuration: 0,
                      }));
                    }}
                  />

                  {/* Optional Direct Video URL Input */}
                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="manual-video-url" className="text-xs font-medium text-muted-foreground">
                      Or Video Link / Stream URL (optional)
                    </Label>
                    <Input
                      id="manual-video-url"
                      placeholder="https://... (auto-filled on file upload, or paste external video URL)"
                      className="text-xs font-mono"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value.trim() })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="lecture-duration" className="text-xs font-medium">
                        Duration (Minutes)
                      </Label>
                      <Input
                        id="lecture-duration"
                        type="number"
                        min="0"
                        placeholder="e.g. 15"
                        value={formData.videoDuration || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, videoDuration: Number(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                      <div>
                        <Label htmlFor="free-preview" className="text-xs font-semibold cursor-pointer">
                          Free Preview Lecture
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Allow potential students to watch without enrolling.
                        </p>
                      </div>
                      <Switch
                        id="free-preview"
                        checked={formData.isPreview}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPreview: checked })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* LIVE CLASS (GOOGLE MEET) SECTION */
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-sm font-semibold text-foreground">
                        Google Meet Live Class Configuration
                      </h4>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("https://meet.google.com/new", "_blank")}
                      className="h-7 gap-1 text-xs border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Create Google Meet
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="google-meet-url" className="text-xs font-medium">
                      Google Meet Link <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="google-meet-url"
                          placeholder="https://meet.google.com/xxx-yyyy-zzz"
                          className="pl-9 font-mono text-xs"
                          value={formData.googleMeetUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              // Auto-extract meet id if format matches
                              const match = val.match(/meet\.google\.com\/([a-z0-9\-]+)/i);
                              return {
                                ...prev,
                                googleMeetUrl: val,
                                meetingId: match ? match[1] : prev.meetingId,
                              };
                            });
                          }}
                          required
                        />
                      </div>
                      {formData.googleMeetUrl && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(formData.googleMeetUrl, "_blank")}
                          className="gap-1 text-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Test
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Paste the meeting invite link. Enrolled students will see this link in their dashboard & curriculum.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="live-scheduled-at" className="text-xs font-medium">
                        Scheduled Date & Time
                      </Label>
                      <Input
                        id="live-scheduled-at"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="live-duration" className="text-xs font-medium">
                        Duration (Minutes)
                      </Label>
                      <Input
                        id="live-duration"
                        type="number"
                        min="15"
                        step="15"
                        placeholder="60"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) || 60 })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="live-status" className="text-xs font-medium">
                        Live Status
                      </Label>
                      <Select
                        value={formData.liveStatus}
                        onValueChange={(val: any) => setFormData({ ...formData, liveStatus: val })}
                      >
                        <SelectTrigger id="live-status">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="live">Live Now 🔴</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-2 font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-md shadow-cyan-500/25 border border-cyan-300/40"
                >
                  {editingLecture ? "Save Changes" : "Create Lecture"}
                </Button>
              </div>
            </form>
          ) : (
            /* LECTURES LIST VIEW */
            <div className="space-y-4 pt-2">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <Tabs value={filterType} onValueChange={(val: any) => setFilterType(val)}>
                  <TabsList className="bg-muted/60">
                    <TabsTrigger value="all" className="text-xs">
                      All Content ({lectures.length})
                    </TabsTrigger>
                    <TabsTrigger value="recorded" className="text-xs gap-1.5">
                      <Video className="h-3.5 w-3.5 text-primary" />
                      Recorded Videos ({recordedCount})
                    </TabsTrigger>
                    <TabsTrigger value="live" className="text-xs gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-emerald-500" />
                      Live Classes ({liveCount})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
                  <p className="text-sm">Loading curriculum lectures...</p>
                </div>
              ) : filteredLectures.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-12 text-center bg-card/40">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Layers className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground">No lectures found</h4>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Start creating lectures for this course. Upload video files to Cloudinary or schedule interactive live classes via Google Meet.
                  </p>
                  <div className="mt-5 flex gap-3">
                    <Button
                      onClick={() => handleOpenCreate("recorded")}
                      className="gap-2 px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/30 border border-cyan-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Video className="h-4 w-4 stroke-[2.5]" />
                      Upload First Video
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenCreate("live")}
                      className="gap-2 px-5 py-2.5 text-sm font-semibold border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 shadow-sm"
                    >
                      <Radio className="h-4 w-4 text-emerald-400" />
                      Schedule Live Class
                    </Button>
                  </div>
                </div>
              ) : (
                /* Lectures List */
                <div className="space-y-3">
                  {filteredLectures.map((lecture, idx) => {
                    const isRecorded = lecture.type === "recorded";
                    const isLive = lecture.type === "live";

                    return (
                      <div
                        key={lecture._id}
                        className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Icon / Thumbnail */}
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm ${
                              isRecorded
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            }`}
                          >
                            {isRecorded ? <Video className="h-5 w-5" /> : <Radio className="h-5 w-5" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-muted-foreground">
                                #{idx + 1}
                              </span>
                              <h4 className="text-sm font-semibold text-foreground truncate max-w-md">
                                {getLanguageValue(lecture.title)}
                              </h4>
                              {lecture.section && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                                  {lecture.section}
                                </Badge>
                              )}
                              {isRecorded ? (
                                <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border-0 text-[10px]">
                                  Recorded
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 text-[10px]">
                                  Google Meet Live
                                </Badge>
                              )}
                              {lecture.isPreview && (
                                <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                                  Free Preview
                                </Badge>
                              )}
                              {lecture.status === "draft" && (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                  Draft
                                </Badge>
                              )}
                            </div>

                            {/* Details Row */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              {isRecorded && lecture.videoDuration ? (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lecture.videoDuration} mins
                                </span>
                              ) : null}

                              {isLive && lecture.liveMeeting?.scheduledAt && (
                                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(lecture.liveMeeting.scheduledAt), "MMM d, yyyy h:mm a")}
                                </span>
                              )}

                              {isLive && lecture.liveMeeting?.meetingUrl && (
                                <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                                  <LinkIcon className="h-3 w-3" />
                                  {lecture.liveMeeting.meetingUrl}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {isRecorded && lecture.videoUrl && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewVideoUrl(lecture.videoUrl || null)}
                              className="h-8 gap-1 text-xs"
                            >
                              <Play className="h-3.5 w-3.5 text-primary" />
                              Preview
                            </Button>
                          )}

                          {isLive && lecture.liveMeeting?.meetingUrl && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  copyToClipboard(lecture.liveMeeting!.meetingUrl, "Google Meet Link")
                                }
                                title="Copy Google Meet Link"
                                className="h-8 gap-1 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy Link
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => window.open(lecture.liveMeeting!.meetingUrl, "_blank")}
                                className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Join
                              </Button>
                            </>
                          )}

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEdit(lecture)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(lecture._id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Preview Modal */}
      <Dialog open={!!previewVideoUrl} onOpenChange={(open) => !open && setPreviewVideoUrl(null)}>
        <DialogContent className="max-w-3xl p-4 bg-black/95 border-border">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-medium text-white flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" /> Video Player
            </DialogTitle>
          </DialogHeader>
          {previewVideoUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video src={previewVideoUrl} controls autoPlay className="h-full w-full object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </>
  );
}
