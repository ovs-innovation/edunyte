import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { UserTable } from '@/components/users/UserTable';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter } from 'lucide-react';
import { UsersAPI, ApiUser } from '@/lib/api';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { useToast } from '@/hooks/use-toast';
import { UserViewDialog } from '@/components/users/UserViewDialog';

const UsersPage = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [viewUser, setViewUser] = useState<ApiUser | null>(null);
  const { toast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await UsersAPI.list();
      setUsers(data.users || []);
    } catch (err: any) {
      toast({ title: 'Failed to load users', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaved = (user: ApiUser) => {
    setUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.map((u) => (u.id === user.id ? user : u));
      return [user, ...prev];
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await UsersAPI.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: 'User deleted' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err?.message, variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
            <p className="mt-1 text-muted-foreground">
              Manage user accounts and permissions.
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
            <PermissionGate permission="users.create">
              <Button
                size="sm"
                className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
                onClick={() => {
                  setEditUser(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Table */}
        <div className="animate-slide-up">
          <UserTable
            users={users}
            loading={loading}
            onEdit={(user) => {
              setEditUser(user);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
            onView={(user) => setViewUser(user)}
          />
        </div>
      </div>
      <UserFormDialog
        open={dialogOpen}
        mode={editUser ? 'edit' : 'create'}
        user={editUser}
        onClose={() => {
          setDialogOpen(false);
          setEditUser(null);
        }}
        onSaved={handleSaved}
      />
      <UserViewDialog open={!!viewUser} user={viewUser} onClose={() => setViewUser(null)} />
    </AdminLayout>
  );
};

export default UsersPage;
