import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TeacherTable } from '@/components/teachers/TeacherTable';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { TeacherProfileAPI, ApiTeacherProfile, UsersAPI, ApiUser } from '@/lib/api';
import { TeacherProfileDialog } from '@/components/teachers/TeacherProfileDialog';
import { useToast } from '@/hooks/use-toast';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Array<ApiTeacherProfile & { userId: ApiUser }>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewProfile, setViewProfile] = useState<ApiTeacherProfile & { userId: ApiUser } | null>(null);
  const [editProfile, setEditProfile] = useState<ApiTeacherProfile & { userId: ApiUser } | null>(null);
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
    try {
      const res = await TeacherProfileAPI.updateKyc(userId, status);
      handleSaved(res.profile);
      toast({ title: 'KYC status updated' });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
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
    </AdminLayout>
  );
};

export default TeachersPage;

