import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { UserTable } from '@/components/users/UserTable';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, Filter, Search } from 'lucide-react';
import { UsersAPI, ApiUser } from '@/lib/api';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { useToast } from '@/hooks/use-toast';
import { UserViewDialog } from '@/components/users/UserViewDialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UsersPage = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [viewUser, setViewUser] = useState<ApiUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(user.role);
      const matchesSearch =
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, selectedRoles, searchQuery]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map((u) => u.role));
    return Array.from(roles);
  }, [users]);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
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
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8 w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter {selectedRoles.length > 0 && `(${selectedRoles.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {uniqueRoles.map((role) => (
                  <DropdownMenuCheckboxItem
                    key={role}
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => toggleRole(role)}
                    className="capitalize"
                  >
                    {role.replace('_', ' ')}
                  </DropdownMenuCheckboxItem>
                ))}
                {uniqueRoles.length === 0 && (
                   <div className="p-2 text-sm text-muted-foreground text-center">No roles found</div>
                )}
                {selectedRoles.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={false}
                      onCheckedChange={() => setSelectedRoles([])}
                      className="justify-center text-center font-medium text-destructive focus:text-destructive"
                    >
                      Clear Filters
                    </DropdownMenuCheckboxItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
            users={filteredUsers}
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
