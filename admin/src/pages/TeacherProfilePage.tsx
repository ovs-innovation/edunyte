import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeacherProfileAPI, ApiTeacherProfile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeacherProfileForm } from '@/components/teachers/TeacherProfileForm';

const TeacherProfilePage = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ApiTeacherProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentRole !== 'teacher') {
      navigate('/');
      return;
    }
    loadProfile();
  }, [currentRole]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await TeacherProfileAPI.getMyProfile();
      setProfile(data.profile);
    } catch (err: any) {
      toast({ title: 'Failed to load profile', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">Loading profile...</div>
      </AdminLayout>
    );
  }

  const kycStatus = profile?.kycStatus || 'pending';
  const kycStatusConfig = {
    verified: { label: 'Verified', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle2 },
    pending: { label: 'Pending Verification', color: 'bg-warning/20 text-warning border-warning/30', icon: Clock },
    rejected: { label: 'Rejected', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: XCircle },
  };

  const KycIcon = kycStatusConfig[kycStatus].icon;

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage your teacher profile and account settings.</p>
        </div>

        {/* KYC Status */}
        <Card className="border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className={cn("rounded-lg p-2 shrink-0 mt-0.5 sm:mt-0", kycStatusConfig[kycStatus].color)}>
                <KycIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-foreground">KYC Status: {kycStatusConfig[kycStatus].label}</p>
                <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {kycStatus === 'verified'
                    ? <p>Your profile is verified and active.</p>
                    : kycStatus === 'pending'
                      ? <p>Your profile is under admin review. You can still create courses.</p>
                      : (
                        <div className="flex flex-col gap-1">
                          {(profile?.rejectionReason || (profile as any)?.kycRejectionReason || (profile as any)?.reason) && (
                            <p className="font-semibold text-destructive">Reason: {profile?.rejectionReason || (profile as any)?.kycRejectionReason || (profile as any)?.reason}</p>
                          )}
                          <p>Your KYC was rejected. Please update your details or contact admin.</p>
                        </div>
                      )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className={cn("self-start sm:self-center border text-xs", kycStatusConfig[kycStatus].color)}>
              {kycStatusConfig[kycStatus].label}
            </Badge>
          </div>
        </Card>

        <TeacherProfileForm
          profile={profile}
          onSuccess={(updatedProfile) => {
            setProfile(updatedProfile);
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default TeacherProfilePage;

