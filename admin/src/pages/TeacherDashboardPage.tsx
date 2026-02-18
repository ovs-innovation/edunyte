import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  MessageSquare,
  Calendar,
  AlertCircle,
  Pencil,
  ArrowLeft
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { TeacherProfileAPI, ApiTeacherProfile } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { TeacherProfileForm } from '@/components/teachers/TeacherProfileForm';

const TeacherDashboardPage = () => {
  const { currentRole } = useRole();
  const [profile, setProfile] = useState<ApiTeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingKyc, setIsEditingKyc] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const stats = [
    {
      label: 'Total Courses',
      value: profile?.totalCourses || 0,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Published Courses',
      value: profile?.publishedCourses || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total Students',
      value: profile?.totalStudents || 0,
      icon: GraduationCap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Rating',
      value: profile?.rating ? profile.rating.toFixed(1) : '0.0',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      suffix: `(${profile?.totalReviews || 0})`,
    },
  ];

  const earnings = [
    {
      label: 'Total Earnings',
      value: `₹${(profile?.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    {
      label: 'Pending Payout',
      value: `₹${(profile?.pendingPayout || 0).toLocaleString()}`,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'Paid Amount',
      value: `₹${(profile?.paidAmount || 0).toLocaleString()}`,
      icon: CheckCircle2,
      color: 'text-success',
    },
  ];

  const kycStatus = profile?.kycStatus || 'pending';
  const kycStatusConfig = {
    verified: { label: 'Verified', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle2 },
    pending: { label: 'Pending', color: 'bg-warning/20 text-warning border-warning/30', icon: Clock },
    rejected: { label: 'Rejected', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: XCircle },
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {isEditingKyc && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingKyc(false)}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
              {isEditingKyc ? 'Update KYC Details' : 'Teacher Dashboard'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEditingKyc ? 'Provide your profile and bank details for verification.' : 'Manage your courses, students, and earnings'}
            </p>
          </div>
          {!isEditingKyc && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/teacher-profile')}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </Button>
              <Button
                onClick={() => navigate('/teacher/join-course')}
                className="gradient-primary text-primary-foreground hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Join Course
              </Button>
            </div>
          )}
        </div>

        {isEditingKyc ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TeacherProfileForm
              profile={profile}
              onSuccess={(updatedProfile) => {
                setProfile(updatedProfile);
                setIsEditingKyc(false);
              }}
              onCancel={() => setIsEditingKyc(false)}
            />
          </div>
        ) : (
          <>
            {/* KYC Status Alert */}
            {kycStatus !== 'verified' && (
              <Card className={cn(
                "border-l-4 p-5 animate-slide-up shadow-sm transition-all hover:shadow-md",
                kycStatus === 'pending' ? "border-l-warning bg-warning/5" : "border-l-destructive bg-destructive/5"
              )}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "rounded-full p-2.5",
                      kycStatus === 'pending' ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
                    )}>
                      {kycStatus === 'pending' ? <Clock className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                        KYC Status: {kycStatusConfig[kycStatus].label}
                        {kycStatus === 'pending' && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-medium">
                            Under Review
                          </Badge>
                        )}
                      </h3>
                      <div className="text-muted-foreground max-w-2xl mt-1">
                        {kycStatus === 'pending'
                          ? <p>Your profile is currently being verified by our team. Please ensure all your details are up-to-date for a faster approval.</p>
                          : (
                            <div className="flex flex-col gap-3">
                              {(profile?.rejectionReason || (profile as any)?.kycRejectionReason || (profile as any)?.reason) ? (
                                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                                  <p className="text-base text-destructive font-bold italic leading-relaxed">
                                    "{profile?.rejectionReason || (profile as any)?.kycRejectionReason || (profile as any)?.reason}"
                                  </p>
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                                  <p className="text-destructive italic m-0">
                                    No specific reason provided by admin. Please ensure your profile is complete.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Button
                      onClick={() => setIsEditingKyc(true)}
                      className={cn(
                        "font-semibold shadow-sm transition-all hover:scale-105 active:scale-95",
                        kycStatus === 'pending' ? "bg-warning hover:bg-warning/90 text-warning-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      )}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      {kycStatus === 'pending' ? 'Update Details' : 'Edit & Re-submit'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card
                  key={stat.label}
                  className="border-border bg-card p-6 animate-slide-up hover:shadow-lg transition-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("rounded-lg p-2.5", stat.bgColor)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-foreground">
                    {stat.value} {stat.suffix && <span className="text-sm text-muted-foreground font-normal">{stat.suffix}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>

            {/* Earnings Section */}
            <div className="grid gap-6 lg:grid-cols-3">
              {earnings.map((earning, index) => (
                <Card
                  key={earning.label}
                  className="border-border bg-card p-6 animate-slide-up"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{earning.label}</p>
                      <p className={cn("mt-2 text-2xl font-bold", earning.color)}>{earning.value}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <earning.icon className={cn("h-6 w-6", earning.color)} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
                <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => navigate('/teacher/my-courses')}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>My Courses</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => navigate('/teacher/join-course')}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Join Course</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => navigate('/teacher/availability')}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>My Availability</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => navigate('/teacher/bookings')}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>My Bookings</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => navigate('/students')}
                  >
                    <Users className="h-5 w-5" />
                    <span>My Students</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </Button>
                </div>
              </Card>

              <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '800ms' }}>
                <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">No recent activity</span>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeacherDashboardPage;

