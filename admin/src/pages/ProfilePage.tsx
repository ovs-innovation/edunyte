import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UsersAPI, AuthAPI, ApiUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await AuthAPI.me();
        setUser(data.user);
        setName(data.user.name || '');
        setEmail(data.user.email || '');
      } catch (err: any) {
        toast({ title: 'Failed to load profile', description: err?.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await UsersAPI.update(user.id, {
        name,
        email,
        password: password || undefined,
      });
      setUser(res.user);
      setPassword('');
      localStorage.setItem('user-email', res.user.email);
      localStorage.setItem('user-name', res.user.name || res.user.email);
      toast({ title: 'Profile updated' });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">Loading profile...</div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px] text-destructive">
          Unable to load profile.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">View and update your account details.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>New Password (optional)</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving || !name || !email}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>

          <Card className="border-border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline" className="capitalize">
                {user.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Last login</p>
              <p className="text-sm text-foreground">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm text-foreground">
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;

