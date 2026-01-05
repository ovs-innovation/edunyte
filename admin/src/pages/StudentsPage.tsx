import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StudentTable } from '@/components/students/StudentTable';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { StudentProfileAPI, ApiStudentProfile, UsersAPI, ApiUser } from '@/lib/api';
import { StudentProfileDialog } from '@/components/students/StudentProfileDialog';
import { useToast } from '@/hooks/use-toast';

const StudentsPage = () => {
  const [students, setStudents] = useState<Array<ApiStudentProfile & { userId: ApiUser }>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewProfile, setViewProfile] = useState<ApiStudentProfile & { userId: ApiUser } | null>(null);
  const [editProfile, setEditProfile] = useState<ApiStudentProfile & { userId: ApiUser } | null>(null);
  const { toast } = useToast();

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await StudentProfileAPI.list();
      // Fetch user details for each student
      const studentsWithUsers = await Promise.all(
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
      setStudents(studentsWithUsers);
    } catch (err: any) {
      toast({ title: 'Failed to load students', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSaved = (profile: ApiStudentProfile) => {
    setStudents((prev) => {
      const exists = prev.find((s) => s._id === profile._id);
      if (exists) {
        const userId = typeof profile.userId === 'string' ? profile.userId : profile.userId._id || profile.userId.id;
        const user = exists.userId;
        return prev.map((s) => (s._id === profile._id ? { ...profile, userId: user } : s));
      }
      return prev;
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Students</h1>
            <p className="mt-1 text-muted-foreground">
              Manage student profiles and track progress.
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
          <StudentTable
            students={students}
            loading={loading}
            onEdit={(profile) => {
              setEditProfile(profile);
              setDialogOpen(true);
            }}
            onView={(profile) => {
              setViewProfile(profile);
              setDialogOpen(true);
            }}
          />
        </div>
      </div>

      {/* View Dialog */}
      <StudentProfileDialog
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
      <StudentProfileDialog
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

export default StudentsPage;

