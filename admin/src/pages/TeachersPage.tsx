import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TeacherTable } from '@/components/teachers/TeacherTable';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { TeacherProfileAPI, ApiTeacherProfile, UsersAPI, ApiUser } from '@/lib/api';
import { TeacherProfileDialog } from '@/components/teachers/TeacherProfileDialog';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Array<ApiTeacherProfile & { userId: ApiUser }>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewProfile, setViewProfile] = useState<ApiTeacherProfile & { userId: ApiUser } | null>(null);
  const [editProfile, setEditProfile] = useState<ApiTeacherProfile & { userId: ApiUser } | null>(null);
  const [kycRejectOpen, setKycRejectOpen] = useState(false);
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);
  const { toast } = useToast();

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await TeacherProfileAPI.list();
      // Fetch user details for each teacher
      const teachersWithUsers = await Promise.all(
        (data.profiles || []).map(async (profile) => {
          const userId = typeof profile.userId === 'string' ? profile.userId : profile.userId._id || profile.userId.id;
          try {
            const userData = await UsersAPI.list();
            const user = userData.users.find((u) => u.id === userId);
            return {
              ...profile,
              userId: user || profile.userId,
            };
          } catch {
            return { ...profile, userId: profile.userId };
          }
        })
      );
      setTeachers(teachersWithUsers);
    } catch (err: any) {
      toast({ title: 'Failed to load teachers', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleSaved = (profile: ApiTeacherProfile) => {
    setTeachers((prev) => {
      const exists = prev.find((t) => t._id === profile._id);
      if (exists) {
        const userId = typeof profile.userId === 'string' ? profile.userId : profile.userId._id || profile.userId.id;
        const user = exists.userId;
        return prev.map((t) => (t._id === profile._id ? { ...profile, userId: user } : t));
      }
      return prev;
    });
  };

  const handleKycUpdate = async (userId: string, status: "pending" | "verified" | "rejected") => {
    if (status === 'rejected') {
      setRejectingUserId(userId);
      setRejectionReason('');
      setKycRejectOpen(true);
      return;
    }

    try {
      const res = await TeacherProfileAPI.updateKyc(userId, status);
      handleSaved(res.profile);
      toast({ title: 'KYC status updated' });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingUserId || !rejectionReason.trim()) {
      toast({ title: 'Reason required', description: 'Please provide a reason for rejection', variant: 'destructive' });
      return;
    }

    setIsSubmittingReject(true);
    try {
      const res = await TeacherProfileAPI.updateKyc(rejectingUserId, 'rejected', rejectionReason);
      handleSaved(res.profile);
      toast({ title: 'KYC status updated to rejected' });
      setKycRejectOpen(false);
      setRejectingUserId(null);
      setRejectionReason('');
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
    } finally {
      setIsSubmittingReject(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Teachers</h1>
            <p className="mt-1 text-muted-foreground">
              Manage teacher profiles and KYC verification.
            </p>
          </div>
          <div className="flex items-center gap-3">
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
        <div className="animate-slide-up">
          <TeacherTable
            teachers={teachers}
            loading={loading}
            onEdit={(profile) => {
              setEditProfile(profile);
              setDialogOpen(true);
            }}
            onView={(profile) => {
              setViewProfile(profile);
              setDialogOpen(true);
            }}
            onKycUpdate={handleKycUpdate}
          />
        </div>
      </div>

      {/* View Dialog */}
      <TeacherProfileDialog
        open={dialogOpen && !!viewProfile}
        mode="view"
        profile={viewProfile}
        onClose={() => {
          setDialogOpen(false);
          setViewProfile(null);
        }}
        onSaved={handleSaved}
      />

      {/* Edit Dialog */}
      <TeacherProfileDialog
        open={dialogOpen && !!editProfile}
        mode="edit"
        profile={editProfile}
        onClose={() => {
          setDialogOpen(false);
          setEditProfile(null);
        }}
        onSaved={handleSaved}
      />

      {/* KYC Rejection Dialog */}
      <Dialog open={kycRejectOpen} onOpenChange={setKycRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason why this teacher's KYC is being rejected. This reason will be shown to the teacher on their dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kycRejectionReason">Rejection Reason</Label>
              <Textarea
                id="kycRejectionReason"
                placeholder="e.g., Incomplete profile information, unclear profile photo..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setKycRejectOpen(false);
                setRejectingUserId(null);
              }}
              disabled={isSubmittingReject}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isSubmittingReject || !rejectionReason.trim()}
            >
              {isSubmittingReject ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default TeachersPage;

