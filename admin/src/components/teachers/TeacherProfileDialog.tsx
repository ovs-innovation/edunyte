import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ApiTeacherProfile, TeacherProfileAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionGate } from "@/components/PermissionGate";

type Mode = "view" | "edit";

interface Props {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  profile?: ApiTeacherProfile & { userId: any } | null;
  userId?: string;
  onSaved?: (profile: ApiTeacherProfile) => void;
}

export function TeacherProfileDialog({ open, mode, onClose, profile, userId, onSaved }: Props) {
  const [bio, setBio] = useState("");
  const [aboutUs, setAboutUs] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [experience, setExperience] = useState(0);
  const [kycStatus, setKycStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [payoutInfo, setPayoutInfo] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
  });
  const [rating, setRating] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const targetUserId = userId || (typeof profile?.userId === 'object' ? profile.userId.id : profile?.userId);

  useEffect(() => {
    if (profile && open) {
      setBio(profile.bio || "");
      setAboutUs(profile.aboutUs || "");
      setExpertise(profile.expertise || []);
      setExperience(profile.experience || 0);
      setKycStatus(profile.kycStatus || "pending");
      setPayoutInfo(profile.payoutInfo || {
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
      });
      setRating(profile.rating || 0);
      setTotalEarnings(profile.totalEarnings || 0);
    } else if (open && userId) {
      // Load profile if userId provided
      loadProfile();
    } else if (open) {
      resetForm();
    }
  }, [profile, open, userId]);

  const loadProfile = async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const data = await TeacherProfileAPI.getProfile(targetUserId);
      if (data.profile) {
        setBio(data.profile.bio || "");
        setAboutUs(data.profile.aboutUs || "");
        setExpertise(data.profile.expertise || []);
        setExperience(data.profile.experience || 0);
        setKycStatus(data.profile.kycStatus || "pending");
        setPayoutInfo(data.profile.payoutInfo || {
          bankName: "",
          accountNumber: "",
          ifscCode: "",
          accountHolderName: "",
        });
        setRating(data.profile.rating || 0);
        setTotalEarnings(data.profile.totalEarnings || 0);
      }
    } catch (err: any) {
      toast({
        title: "Failed to load profile",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBio("");
    setAboutUs("");
    setExpertise([]);
    setExpertiseInput("");
    setExperience(0);
    setKycStatus("pending");
    setPayoutInfo({
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
    });
    setRating(0);
    setTotalEarnings(0);
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput("");
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const res = await TeacherProfileAPI.update(targetUserId, {
        bio,
        aboutUs,
        expertise,
        experience,
        kycStatus,
        payoutInfo,
        rating,
      });
      onSaved?.(res.profile);
      toast({ title: "Profile updated" });
      onClose();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKycUpdate = async (status: "pending" | "verified" | "rejected") => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const res = await TeacherProfileAPI.updateKyc(targetUserId, status);
      setKycStatus(status);
      onSaved?.(res.profile);
      toast({ title: "KYC status updated" });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const user = typeof profile?.userId === 'object' ? profile.userId : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "Teacher Profile" : "Edit Teacher Profile"}
            {user && <span className="text-muted-foreground font-normal ml-2">- {user.name}</span>}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* KYC Status - Admin only */}
          <PermissionGate permission="teachers.manage">
            <div className="space-y-2">
              <Label>KYC Status</Label>
              <div className="flex gap-2">
                {(["pending", "verified", "rejected"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={kycStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => mode === "edit" ? setKycStatus(status) : handleKycUpdate(status)}
                    disabled={loading}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </PermissionGate>

          <div className="space-y-2">
            <Label>Bio</Label>
            {mode === "view" ? (
              <p className="text-sm text-foreground">{bio || "—"}</p>
            ) : (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Teacher bio..."
                rows={3}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>About Us</Label>
            {mode === "view" ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{aboutUs || "—"}</p>
            ) : (
              <Textarea
                value={aboutUs}
                onChange={(e) => setAboutUs(e.target.value)}
                placeholder="Share more details about yourself, your background, teaching philosophy, achievements, etc..."
                rows={6}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Expertise</Label>
            {mode === "view" ? (
              <div className="flex flex-wrap gap-2">
                {expertise.length > 0 ? (
                  expertise.map((exp, i) => (
                    <Badge key={i} variant="outline">
                      {exp}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    placeholder="Add expertise..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExpertise())}
                  />
                  <Button type="button" onClick={handleAddExpertise} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((exp, i) => (
                    <Badge key={i} variant="outline" className="gap-1">
                      {exp}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveExpertise(i)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience (years)</Label>
              {mode === "view" ? (
                <p className="text-sm text-foreground">{experience}</p>
              ) : (
                <Input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                  min="0"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              {mode === "view" ? (
                <p className="text-sm text-foreground">{rating.toFixed(1)}</p>
              ) : (
                <Input
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  min="0"
                  max="5"
                  step="0.1"
                />
              )}
            </div>
          </div>

          <PermissionGate permission="teachers.manage">
            <div className="space-y-2">
              <Label>Total Earnings (₹)</Label>
              {mode === "view" ? (
                <p className="text-sm font-medium text-foreground">₹{totalEarnings.toLocaleString()}</p>
              ) : (
                <Input
                  type="number"
                  value={totalEarnings}
                  onChange={(e) => setTotalEarnings(Number(e.target.value))}
                  min="0"
                />
              )}
            </div>
          </PermissionGate>

          <div className="space-y-2">
            <Label>Payout Information</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Bank Name</Label>
                {mode === "view" ? (
                  <p className="text-sm text-foreground">{payoutInfo.bankName || "—"}</p>
                ) : (
                  <Input
                    value={payoutInfo.bankName}
                    onChange={(e) => setPayoutInfo({ ...payoutInfo, bankName: e.target.value })}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Account Number</Label>
                {mode === "view" ? (
                  <p className="text-sm text-foreground">{payoutInfo.accountNumber || "—"}</p>
                ) : (
                  <Input
                    value={payoutInfo.accountNumber}
                    onChange={(e) => setPayoutInfo({ ...payoutInfo, accountNumber: e.target.value })}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">IFSC Code</Label>
                {mode === "view" ? (
                  <p className="text-sm text-foreground">{payoutInfo.ifscCode || "—"}</p>
                ) : (
                  <Input
                    value={payoutInfo.ifscCode}
                    onChange={(e) => setPayoutInfo({ ...payoutInfo, ifscCode: e.target.value })}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Account Holder Name</Label>
                {mode === "view" ? (
                  <p className="text-sm text-foreground">{payoutInfo.accountHolderName || "—"}</p>
                ) : (
                  <Input
                    value={payoutInfo.accountHolderName}
                    onChange={(e) => setPayoutInfo({ ...payoutInfo, accountHolderName: e.target.value })}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode === "edit" && (
            <Button onClick={handleSave} disabled={loading}>
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

