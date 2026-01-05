import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiUser, RolesAPI, UsersAPI } from "@/lib/api";
import { Permission } from "@/lib/rbac";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  user?: ApiUser | null;
  onSaved: (user: ApiUser) => void;
}

export function UserFormDialog({ open, mode, onClose, user, onSaved }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "pending">("active");
  const [roles, setRoles] = useState<{ id: string; name: string; key: string; permissions: Permission[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await RolesAPI.list();
        setRoles(data.roles);
      } catch (err: any) {
        toast({
          title: "Failed to load roles",
          description: err?.response?.data?.message || err?.message || "Something went wrong",
          variant: "destructive",
        });
        setRoles([]);
      }
    };
    if (open) loadRoles();
  }, [open]);

  useEffect(() => {
    if (user && open) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setStatus((user.status as any) || "active");
    } else if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setStatus("active");
    }
  }, [user, open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (mode === "create") {
        const res = await UsersAPI.create({ name, email, password, role, status });
        onSaved(res.user);
        toast({ title: "User created" });
      } else if (user) {
        const res = await UsersAPI.update(user.id, { name, email, role, status, password: password || undefined });
        onSaved(res.user);
        toast({ title: "User updated" });
      }
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Something went wrong";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add User" : "Edit User"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="User name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" type="email" />
          </div>
          <div className="space-y-2">
            <Label>Password{mode === "edit" ? " (leave blank to keep)" : ""}</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
                  <Checkbox checked={role === r.key} onCheckedChange={() => setRole(r.key)} />
                  <span className="text-sm text-foreground">{r.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-2">
              {["active", "inactive", "pending"].map((s) => (
                <Button
                  key={s}
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(s as any)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !name || !email || (mode === "create" && !password)}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

