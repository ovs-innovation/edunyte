import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiStudentProfile, StudentProfileAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Award, ExternalLink } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Mode = "view" | "edit";

interface Props {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  profile?: ApiStudentProfile & { userId: any } | null;
  userId?: string;
  onSaved?: (profile: ApiStudentProfile) => void;
}

export function StudentProfileDialog({ open, mode, onClose, profile, userId, onSaved }: Props) {
  const [totalHoursSpent, setTotalHoursSpent] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const targetUserId = userId || (typeof profile?.userId === 'object' ? profile.userId.id : profile?.userId);

  useEffect(() => {
    if (profile && open) {
      setTotalHoursSpent(profile.progress?.totalHoursSpent || 0);
    } else if (open && userId) {
      loadProfile();
    } else if (open) {
      resetForm();
    }
  }, [profile, open, userId]);

  const loadProfile = async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const data = await StudentProfileAPI.getProfile(targetUserId);
      if (data.profile) {
        setTotalHoursSpent(data.profile.progress?.totalHoursSpent || 0);
      }
    } catch (err: any) {
      toast({
        title: "Failed to load profile",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTotalHoursSpent(0);
  };

  const handleSave = async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const res = await StudentProfileAPI.update(targetUserId, {
        progress: {
          totalHoursSpent,
        },
      });
      onSaved?.(res.profile);
      toast({ title: "Profile updated" });
      onClose();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const user = typeof profile?.userId === 'object' ? profile.userId : null;
  const progress = profile?.progress || {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHoursSpent: 0,
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "Student Profile" : "Edit Student Profile"}
            {user && <span className="text-muted-foreground font-normal ml-2">- {user.name}</span>}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Progress Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Total Courses</Label>
              <p className="text-2xl font-bold text-foreground">{progress.totalCourses}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Completed</Label>
              <p className="text-2xl font-bold text-success">{progress.completedCourses}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">In Progress</Label>
              <p className="text-2xl font-bold text-warning">{progress.inProgressCourses}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Hours Spent</Label>
              {mode === "view" ? (
                <p className="text-2xl font-bold text-foreground">{progress.totalHoursSpent}h</p>
              ) : (
                <Input
                  type="number"
                  value={totalHoursSpent}
                  onChange={(e) => setTotalHoursSpent(Number(e.target.value))}
                  min="0"
                  className="text-lg"
                />
              )}
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="space-y-2">
            <Label>Enrolled Courses ({profile?.enrolledCourses?.length || 0})</Label>
            {profile?.enrolledCourses && profile.enrolledCourses.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.enrolledCourses.map((course, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">
                          {typeof course.courseId === 'string' ? course.courseId.slice(0, 8) + '...' : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(course.enrolledAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground min-w-[3rem]">{course.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              course.completed
                                ? "bg-success/20 text-success border-success/30"
                                : "bg-warning/20 text-warning border-warning/30"
                            }
                          >
                            {course.completed ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No enrolled courses</p>
            )}
          </div>

          {/* Certificates */}
          <div className="space-y-2">
            <Label>Certificates ({profile?.certificates?.length || 0})</Label>
            {profile?.certificates && profile.certificates.length > 0 ? (
              <div className="space-y-2">
                {profile.certificates.map((cert, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-sm">Certificate #{cert.certificateId}</p>
                        <p className="text-xs text-muted-foreground">
                          Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {cert.certificateUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(cert.certificateUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No certificates</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode === "edit" && (
            <PermissionGate permission="students.edit">
              <Button onClick={handleSave} disabled={loading}>
                Save
              </Button>
            </PermissionGate>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

