import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiStudentProfile, StudentProfileAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Award, ExternalLink, Check, ChevronsUpDown } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { Country, State, City } from 'country-state-city';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Mode = "view" | "edit";

interface Props {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  profile?: ApiStudentProfile & { userId: any } | null;
  userId?: string;
  onSaved?: (profile: ApiStudentProfile) => void;
}

interface SearchableSelectProps {
  value: string;
  onSelect: (value: string, code: string) => void;
  options: { label: string; value: string; code?: string }[];
  placeholder?: string;
  disabled?: boolean;
}

const SearchableSelect = ({ value, onSelect, options, placeholder, disabled }: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(() => options.find((op) => op.value === value)?.label || value, [value, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {value ? selectedLabel : placeholder || "Select..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder?.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.code || option.value}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option.value, option.code || "");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export function StudentProfileDialog({ open, mode, onClose, profile, userId, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
    phone: "",
    timezone: "",
  });
  
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    linkedin: "",
    website: "",
    github: "",
  });

  const targetUserId = userId || (typeof profile?.userId === 'object' ? profile.userId.id : profile?.userId);

  useEffect(() => {
    if (open) {
      if (profile) {
        initializeForm(profile);
      } else if (userId) {
        loadProfile();
      } else {
        resetForm(); 
      }
    }
  }, [profile, open, userId]);

  const initializeForm = (data: ApiStudentProfile) => {
    // Find codes for dependent dropdowns
    const cName = data.country || "";
    const sName = data.state || "";
    
    let cCode = "";
    let sCode = "";

    if (cName) {
      const foundCountry = Country.getAllCountries().find(c => c.name === cName);
      if (foundCountry) {
        cCode = foundCountry.isoCode;
        if (sName) {
           const foundState = State.getStatesOfCountry(cCode).find(s => s.name === sName);
           if (foundState) sCode = foundState.isoCode;
        }
      }
    }

    setFormData({
      country: cName,
      state: sName,
      city: data.city || "",
      phone: data.phone || "",
      timezone: data.timezone || "",
    });
    setSelectedCountryCode(cCode);
    setSelectedStateCode(sCode);

    setSocialLinks({
      facebook: data.socialLinks?.facebook || "",
      twitter: data.socialLinks?.twitter || "",
      linkedin: data.socialLinks?.linkedin || "",
      website: data.socialLinks?.website || "",
      github: data.socialLinks?.github || "",
    });
  };

  const loadProfile = async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const data = await StudentProfileAPI.getProfile(targetUserId);
      if (data.profile) {
        initializeForm(data.profile);
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
    setFormData({ country: "", state: "", city: "", phone: "", timezone: "" });
    setSelectedCountryCode("");
    setSelectedStateCode("");
    setSocialLinks({ facebook: "", twitter: "", linkedin: "", website: "", github: "" });
  };

  const handleSave = async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const res = await StudentProfileAPI.update(targetUserId, {
        ...formData,
        socialLinks,
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

  const user = typeof profile?.userId === 'object' ? profile.userId : null;
  const progress = profile?.progress || {
    totalCourses: 0,
    totalHoursSpent: 0,
    totalLessonsBooked: 0,
    totalLessonsCompleted: 0,
  };

  const completionPercentage = progress.totalLessonsBooked > 0 
    ? Math.round((progress.totalLessonsCompleted / progress.totalLessonsBooked) * 100) 
    : 0;

  // Options for Dropdowns
  const countryOptions = useMemo(() => Country.getAllCountries().map(c => ({ label: c.name, value: c.name, code: c.isoCode })), []);
  const stateOptions = useMemo(() => selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode).map(s => ({ label: s.name, value: s.name, code: s.isoCode })) : [], [selectedCountryCode]);
  const cityOptions = useMemo(() => selectedCountryCode && selectedStateCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(c => ({ label: c.name, value: c.name })) : [], [selectedCountryCode, selectedStateCode]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "Student Profile" : "Edit Student Profile"}
            {user && <span className="text-muted-foreground font-normal ml-2">- {user.name}</span>}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Progress Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Courses</Label>
              <p className="text-2xl font-bold text-foreground">{progress.totalCourses}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Lessons Booked</Label>
              <p className="text-2xl font-bold text-foreground">{progress.totalLessonsBooked}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Completed</Label>
              <p className="text-2xl font-bold text-success">{progress.totalLessonsCompleted}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Hours Spent</Label>
              <p className="text-2xl font-bold text-foreground">{progress.totalHoursSpent}h</p>
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
          </div>

          {/* Location & Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              {mode === "view" ? (
                <div className="p-2 text-sm font-medium">{formData.country || "—"}</div>
              ) : (
                <SearchableSelect
                  value={formData.country}
                  options={countryOptions}
                  placeholder="Select Country"
                  onSelect={(val, code) => {
                    setFormData(prev => ({ ...prev, country: val, state: "", city: "" }));
                    setSelectedCountryCode(code);
                    setSelectedStateCode("");
                  }}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              {mode === "view" ? (
                <div className="p-2 text-sm font-medium">{formData.state || "—"}</div>
              ) : (
                <SearchableSelect
                  value={formData.state}
                  options={stateOptions}
                  placeholder="Select State"
                  disabled={!selectedCountryCode}
                  onSelect={(val, code) => {
                    setFormData(prev => ({ ...prev, state: val, city: "" }));
                    setSelectedStateCode(code);
                  }}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
               {mode === "view" ? (
                <div className="p-2 text-sm font-medium">{formData.city || "—"}</div>
              ) : (
                 <SearchableSelect
                  value={formData.city}
                  options={cityOptions}
                  placeholder="Select City"
                  disabled={!selectedStateCode}
                  onSelect={(val) => {
                    setFormData(prev => ({ ...prev, city: val }));
                  }}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
               {mode === "view" ? (
                <div className="p-2 text-sm font-medium">{formData.phone || "—"}</div>
              ) : (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
               {mode === "view" ? (
                <div className="p-2 text-sm font-medium">{formData.timezone || "—"}</div>
              ) : (
                <SearchableSelect
                  value={formData.timezone}
                  options={Intl.supportedValuesOf('timeZone').map(tz => ({ label: tz, value: tz }))}
                  placeholder="Select Timezone"
                  onSelect={(val) => {
                    setFormData(prev => ({ ...prev, timezone: val }));
                  }}
                />
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm text-foreground">Social Links</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                 {mode === "view" ? (
                  <div className="p-2 text-sm font-medium text-blue-600 truncate">
                    {socialLinks.facebook ? (
                      <a href={socialLinks.facebook} target="_blank" rel="noreferrer">{socialLinks.facebook}</a>
                    ) : "—"}
                  </div>
                ) : (
                  <Input
                    id="facebook"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                 {mode === "view" ? (
                  <div className="p-2 text-sm font-medium text-blue-400 truncate">
                    {socialLinks.twitter ? (
                      <a href={socialLinks.twitter} target="_blank" rel="noreferrer">{socialLinks.twitter}</a>
                    ) : "—"}
                  </div>
                ) : (
                  <Input
                    id="twitter"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                 {mode === "view" ? (
                  <div className="p-2 text-sm font-medium text-blue-700 truncate">
                    {socialLinks.linkedin ? (
                      <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">{socialLinks.linkedin}</a>
                    ) : "—"}
                  </div>
                ) : (
                  <Input
                    id="linkedin"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                 {mode === "view" ? (
                  <div className="p-2 text-sm font-medium text-gray-900 truncate">
                    {socialLinks.github ? (
                      <a href={socialLinks.github} target="_blank" rel="noreferrer">{socialLinks.github}</a>
                    ) : "—"}
                  </div>
                ) : (
                  <Input
                    id="github"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                )}
              </div>
               <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                 {mode === "view" ? (
                  <div className="p-2 text-sm font-medium text-primary truncate">
                    {socialLinks.website ? (
                      <a href={socialLinks.website} target="_blank" rel="noreferrer">{socialLinks.website}</a>
                    ) : "—"}
                  </div>
                ) : (
                  <Input
                    id="website"
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    placeholder="https://..."
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
            <PermissionGate permission="students.edit">
              <Button onClick={handleSave} disabled={loading}>
                Save
              </Button>
            </PermissionGate>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

