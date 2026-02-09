import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TeacherProfileAPI, ApiTeacherProfile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { X, Plus, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CloudinaryImageUploader } from '@/components/ui/cloudinary-image-uploader';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { getAllCountries, getCountryByCode } from '@/utils/countryData';
import * as Flags from 'country-flag-icons/react/3x2';
import { getLanguageValue, normalizeLanguageValue } from '@/lib/languageHelper';

// Helper component to render country flag
const CountryFlag = ({ code, className = 'w-5 h-4' }: { code: string; className?: string }) => {
  if (!code) return null;
  
  const upperCode = code.toUpperCase();
  const FlagComponent = (Flags as Record<string, React.ComponentType<{ className?: string }>>)[upperCode];
  if (!FlagComponent) return null;
  
  return <FlagComponent className={className} />;
};

const TeacherProfilePage = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ApiTeacherProfile | null>(null);
  const [countries] = useState(() => getAllCountries());
  const [countryOpen, setCountryOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [bio, setBio] = useState('');
  const [aboutUs, setAboutUs] = useState('');
  const [photo, setPhoto] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [experience, setExperience] = useState(0);
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    website: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    facebook: '',
  });
  const [payoutInfo, setPayoutInfo] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    upiId: '',
  });


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
      setBio(getLanguageValue(data.profile.bio) || '');
      setAboutUs(getLanguageValue(data.profile.aboutUs) || '');
      setPhoto(data.profile.photo || '');
      setExpertise(data.profile.expertise || []);
      setExperience(data.profile.experience || 0);
      setCountry(data.profile.country || '');
      setCountryCode(data.profile.countryCode || '');
      setSocialLinks({
        website: data.profile.socialLinks?.website || '',
        linkedin: data.profile.socialLinks?.linkedin || '',
        twitter: data.profile.socialLinks?.twitter || '',
        youtube: data.profile.socialLinks?.youtube || '',
        facebook: data.profile.socialLinks?.facebook || '',
      });
      setPayoutInfo({
        bankName: data.profile.payoutInfo?.bankName || '',
        accountNumber: data.profile.payoutInfo?.accountNumber || '',
        ifscCode: data.profile.payoutInfo?.ifscCode || '',
        accountHolderName: data.profile.payoutInfo?.accountHolderName || '',
        upiId: data.profile.payoutInfo?.upiId || '',
      });
    } catch (err: any) {
      toast({ title: 'Failed to load profile', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };

  const handleCountryChange = (code: string) => {
    const countryData = getCountryByCode(code);
    if (countryData) {
      setCountry(countryData.name);
      setCountryCode(countryData.isoCode);
    } else {
      setCountryCode(code);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await TeacherProfileAPI.updateMyProfile({
        bio: normalizeLanguageValue(bio),
        aboutUs: normalizeLanguageValue(aboutUs),
        photo,
        expertise,
        experience,
        country,
        countryCode,
        socialLinks,
        payoutInfo,
      });
      setProfile(res.profile);
      toast({ title: 'Profile updated successfully' });
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

  const kycStatus = profile?.kycStatus || 'pending';
  const kycStatusConfig = {
    verified: { label: 'Verified', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle2 },
    pending: { label: 'Pending Verification', color: 'bg-warning/20 text-warning border-warning/30', icon: Clock },
    rejected: { label: 'Rejected', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: XCircle },
  };
  
  const KycIcon = kycStatusConfig[kycStatus].icon;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your teacher profile and account settings.</p>
        </div>

        {/* KYC Status */}
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", kycStatusConfig[kycStatus].color)}>
                <KycIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">KYC Status: {kycStatusConfig[kycStatus].label}</p>
                <p className="text-sm text-muted-foreground">
                  {kycStatus === 'verified' 
                    ? 'Your profile is verified and active.'
                    : kycStatus === 'pending'
                    ? 'Your profile is under admin review. You can still create courses.'
                    : 'Your KYC was rejected. Please contact admin for assistance.'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={cn("border", kycStatusConfig[kycStatus].color)}>
              {kycStatusConfig[kycStatus].label}
            </Badge>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <Card className="lg:col-span-2 border-border bg-card p-6 space-y-6">
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <CloudinaryImageUploader
                imageUrl={photo}
                onImageChange={(url) => setPhoto(url || "")}
                folder="teacher-profiles"
                maxSize={5 * 1024 * 1024}
              />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell students about yourself..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>About Us</Label>
              <Textarea
                value={aboutUs}
                onChange={(e) => setAboutUs(e.target.value)}
                placeholder="Share more details about yourself, your background, teaching philosophy, achievements, etc..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Provide a detailed description about yourself, your teaching approach, background, and what makes you unique.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Expertise</Label>
              <div className="flex gap-2">
                <Input
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  placeholder="Add expertise (e.g., Web Development)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                />
                <Button type="button" onClick={handleAddExpertise} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
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

            <div className="space-y-2">
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {countryCode && <CountryFlag code={countryCode} />}
                      <span>
                        {countryCode
                          ? countries.find((c) => c.isoCode === countryCode)?.name
                          : 'Select country...'}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map((countryItem) => (
                          <CommandItem
                            key={countryItem.isoCode}
                            value={`${countryItem.isoCode} ${countryItem.name}`}
                            onSelect={() => {
                              handleCountryChange(countryItem.isoCode);
                              setCountryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                countryCode === countryItem.isoCode ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <CountryFlag code={countryItem.isoCode} className="w-5 h-4 mr-2" />
                            <span>{countryItem.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <Label>Social Links</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Website</Label>
                  <Input
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">LinkedIn</Label>
                  <Input
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Twitter</Label>
                  <Input
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">YouTube</Label>
                  <Input
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Facebook</Label>
                  <Input
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Payout Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Bank Name</Label>
                  <Input
                    value={payoutInfo.bankName}
                    onChange={(e) => setPayoutInfo({ ...payoutInfo, bankName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Account Number</Label>
                  <Input
                    value={payoutInfo.accountNumber}
                    onChange={(e) => setPayoutInfo({ ...payoutInfo, accountNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">IFSC Code</Label>
                  <Input
                    value={payoutInfo.ifscCode}
                    onChange={(e) => setPayoutInfo({ ...payoutInfo, ifscCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Account Holder Name</Label>
                  <Input
                    value={payoutInfo.accountHolderName}
                    onChange={(e) => setPayoutInfo({ ...payoutInfo, accountHolderName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">UPI ID</Label>
                  <Input
                    value={payoutInfo.upiId}
                    onChange={(e) => setPayoutInfo({ ...payoutInfo, upiId: e.target.value })}
                    placeholder="yourname@upi"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>

          {/* Stats Sidebar */}
          <Card className="border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Profile Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Courses</span>
                <span className="font-medium text-foreground">{profile?.totalCourses || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Published</span>
                <span className="font-medium text-foreground">{profile?.publishedCourses || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Students</span>
                <span className="font-medium text-foreground">{profile?.totalStudents || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium text-foreground">
                  {profile?.rating ? profile.rating.toFixed(1) : '0.0'} ⭐
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-medium text-foreground">{profile?.totalReviews || 0}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-3">Earnings</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium text-emerald-500">
                    ₹{(profile?.totalEarnings || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-warning">
                    ₹{(profile?.pendingPayout || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium text-success">
                    ₹{(profile?.paidAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherProfilePage;

