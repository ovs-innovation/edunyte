import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TeacherProfileAPI, ApiTeacherProfile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Check, ChevronsUpDown, AlertCircle } from 'lucide-react';
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

interface TeacherProfileFormProps {
    profile: ApiTeacherProfile | null;
    onSuccess?: (profile: ApiTeacherProfile) => void;
    onCancel?: () => void;
}

export function TeacherProfileForm({ profile, onSuccess, onCancel }: TeacherProfileFormProps) {
    const [saving, setSaving] = useState(false);
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
        if (profile) {
            setBio(getLanguageValue(profile.bio) || '');
            setAboutUs(getLanguageValue(profile.aboutUs) || '');
            setPhoto(profile.photo || '');
            setExpertise(profile.expertise || []);
            setExperience(profile.experience || 0);
            setCountry(profile.country || '');
            setCountryCode(profile.countryCode || '');
            setSocialLinks({
                website: profile.socialLinks?.website || '',
                linkedin: profile.socialLinks?.linkedin || '',
                twitter: profile.socialLinks?.twitter || '',
                youtube: profile.socialLinks?.youtube || '',
                facebook: profile.socialLinks?.facebook || '',
            });
            setPayoutInfo({
                bankName: profile.payoutInfo?.bankName || '',
                accountNumber: profile.payoutInfo?.accountNumber || '',
                ifscCode: profile.payoutInfo?.ifscCode || '',
                accountHolderName: profile.payoutInfo?.accountHolderName || '',
                upiId: profile.payoutInfo?.upiId || '',
            });
        }
    }, [profile]);

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
            toast({ title: 'Profile updated successfully' });
            onSuccess?.(res.profile);
        } catch (err: any) {
            toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <Card className="lg:col-span-2 border-border bg-card p-6 space-y-6">
                {profile?.kycStatus === 'rejected' && (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-destructive/20 p-2 rounded-full text-destructive">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-destructive mb-2">KYC Verification Rejected</h4>
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-sm text-destructive font-bold italic leading-relaxed">
                                    "{profile?.rejectionReason || (profile as any)?.kycRejectionReason || (profile as any)?.reason || "Please update your profile information and ensure all details are accurate."}"
                                </p>
                            </div>
                            <p className="text-[11px] text-destructive/70 mt-2">
                                Please fix the issues above and click "Save Changes" to re-submit.
                            </p>
                        </div>
                    </div>
                )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex justify-end gap-3 pt-4">
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel} disabled={saving}>
                            Cancel
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground min-w-[120px]">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </Card>

            {/* Stats Sidebar */}
            <Card className="border-border bg-card p-6 h-fit space-y-4">
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
    );
}
