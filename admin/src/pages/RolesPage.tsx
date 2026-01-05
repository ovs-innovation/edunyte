import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PermissionGate } from '@/components/PermissionGate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Permission } from '@/lib/rbac';
import { ApiRole, RolesAPI } from '@/lib/api';

const RolesPage = () => {
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ name: '', key: '', permissions: [] as Permission[] });
  const [editForm, setEditForm] = useState<{ permissions: Permission[] }>({ permissions: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await RolesAPI.list();
        setRoles(data.roles);
        setPermissions(data.permissions);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const togglePerm = (list: Permission[], perm: Permission) =>
    list.includes(perm) ? list.filter((p) => p !== perm) : [...list, perm];

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        key: createForm.key.trim() || undefined,
        permissions: createForm.permissions,
      };
      const res = await RolesAPI.create(payload);
      setRoles((prev) => [res.role, ...prev]);
      setCreateOpen(false);
      setCreateForm({ name: '', key: '', permissions: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editRoleId) return;
    setSaving(true);
    try {
      const res = await RolesAPI.update(editRoleId, { permissions: editForm.permissions });
      setRoles((prev) => prev.map((r) => (r.id === res.role.id ? res.role : r)));
      setEditRoleId(null);
      setEditForm({ permissions: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const currentEditRole = useMemo(() => roles.find((r) => r.id === editRoleId), [roles, editRoleId]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Roles & Permissions</h1>
            <p className="mt-1 text-muted-foreground">Configure access levels and permissions for each role.</p>
          </div>
          <PermissionGate permission="roles.manage">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 gradient-primary text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={createForm.name}
                      onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Content Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Key (optional)</Label>
                    <Input
                      value={createForm.key}
                      onChange={(e) => setCreateForm((f) => ({ ...f, key: e.target.value }))}
                      placeholder="content_manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {permissions.map((perm) => (
                        <label key={perm} className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
                          <Checkbox
                            checked={createForm.permissions.includes(perm)}
                            onCheckedChange={() =>
                              setCreateForm((f) => ({ ...f, permissions: togglePerm(f.permissions, perm) }))
                            }
                          />
                          <span className="text-sm text-foreground">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={saving || !createForm.name.trim()}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {!loading &&
            roles.map((role, index) => {
              const perms = role.permissions || [];
              return (
                <Card
                  key={role.id}
                  className="relative overflow-hidden border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-glow animate-slide-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="absolute inset-0 gradient-card opacity-40" />
                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge className="mb-1 bg-primary/10 text-primary border border-primary/20">
                          {role.name}
                        </Badge>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Key: {role.key}</p>
                      </div>
                      <PermissionGate permission="roles.manage">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditRoleId(role.id);
                            setEditForm({ permissions: perms });
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Permissions ({perms.length}/{permissions.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {perms.slice(0, 8).map((perm) => (
                          <div
                            key={perm}
                            className={cn(
                              'flex items-center gap-1 rounded-md px-2 py-1 text-xs border border-success/30 bg-success/10 text-success'
                            )}
                          >
                            <Check className="h-3 w-3" />
                            {perm.split('.')[0]}
                          </div>
                        ))}
                        {perms.length > 8 && (
                          <span className="px-2 py-1 text-xs text-muted-foreground">+{perms.length - 8} more</span>
                        )}
                        {perms.length === 0 && (
                          <span className="px-2 py-1 text-xs text-muted-foreground border border-border rounded-md">
                            No permissions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Card className="border-border bg-card overflow-hidden">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold text-foreground">Permission Matrix</h3>
              <p className="text-sm text-muted-foreground">Overview of all permissions across roles</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left font-medium text-muted-foreground">Permission</th>
                    {roles.map((role) => (
                      <th key={role.id} className="p-4 text-center font-medium text-muted-foreground">
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((perm) => (
                    <tr key={perm} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-4 font-medium text-foreground">{perm}</td>
                      {roles.map((role) => (
                        <td key={`${role.id}-${perm}`} className="p-4 text-center">
                          {role.permissions.includes(perm) ? (
                            <Check className="mx-auto h-5 w-5 text-success" />
                          ) : (
                            <span className="mx-auto h-5 w-5 text-muted-foreground/50">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={!!editRoleId} onOpenChange={(open) => !open && setEditRoleId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Permissions {currentEditRole ? `- ${currentEditRole.name}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {permissions.map((perm) => (
              <label key={perm} className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
                <Checkbox
                  checked={editForm.permissions.includes(perm)}
                  onCheckedChange={() =>
                    setEditForm((f) => ({ permissions: togglePerm(f.permissions, perm) }))
                  }
                />
                <span className="text-sm text-foreground">{perm}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleId(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default RolesPage;
