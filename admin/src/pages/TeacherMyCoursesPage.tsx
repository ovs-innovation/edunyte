import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, XCircle, Clock, Plus, Video, ExternalLink, LogOut, Edit } from 'lucide-react';
import { TeacherCourseJoinAPI, ApiTeacherCourse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getLanguageValue } from '@/lib/languageHelper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { getCurrencies, getLanguages as getLibraryLanguages } from '@/utils/countryData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

// Proficiency levels (kept in sync with backend schema)
const PROFICIENCY_LEVELS = [
  { value: 'native', label: 'Native' },
  { value: 'c2', label: 'Proficient C2' },
  { value: 'c1', label: 'Advanced C1' },
  { value: 'b2', label: 'Upper Intermediate B2' },
  { value: 'b1', label: 'Intermediate B1' },
  { value: 'a2', label: 'Elementary A2' },
  { value: 'a1', label: 'Beginner A1' },
] as const;

type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number]['value'];

const PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = PROFICIENCY_LEVELS.reduce(
  (acc, level) => {
    acc[level.value] = level.label;
    return acc;
  },
  {} as Record<ProficiencyLevel, string>
);

const getProficiencyLabel = (value?: string) => {
  if (!value) return '';
  const key = value.toLowerCase() as ProficiencyLevel;
  return PROFICIENCY_LABELS[key] || value.toUpperCase();
};

interface LanguageWithProficiency {
  code: string;
  proficiency: ProficiencyLevel;
}

const TeacherMyCoursesPage = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [teacherCourses, setTeacherCourses] = useState<ApiTeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const [currencies] = useState(() => getCurrencies());
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [formData, setFormData] = useState({
    languages: [] as LanguageWithProficiency[],
    price: '',
    currency: 'USD',
    introductionVideo: '',
    experience: '',
    bio: '',
    aboutCourse: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [proficiencyDialogOpen, setProficiencyDialogOpen] = useState(false);
  const [selectedLanguageForProficiency, setSelectedLanguageForProficiency] = useState<string | null>(null);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (currentRole !== 'teacher') {
      navigate('/');
      return;
    }
    setLanguages(getLibraryLanguages());
    loadMyCourses();
  }, [currentRole, filterStatus]);

  const loadMyCourses = async () => {
    setLoading(true);
    try {
      const status = filterStatus !== 'all' ? filterStatus : undefined;
      const data = await TeacherCourseJoinAPI.getMyCourses(status);
      const list = data.teacherCourses || [];
      setTeacherCourses(list);
    } catch (err: any) {
      toast({ title: 'Failed to load courses', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (course: ApiTeacherCourse['courseId']) => {
    if (typeof course === 'string') return 'Unknown';
    return getLanguageValue(course.name) || 'Unknown';
  };

  const getLanguageNames = (languagesArr: ApiTeacherCourse['languageIds']) => {
    if (!Array.isArray(languagesArr)) return 'Unknown';
    return languagesArr
      .map((lang) => {
        if (typeof lang === 'string') return 'Unknown';
        const code = lang.code || '';
        const lib = code
          ? libraryLanguageByCode.get(code) ||
            libraryLanguageByCode.get(code.toLowerCase()) ||
            libraryLanguageByCode.get(code.toUpperCase())
          : null;
        if (lib) {
          return getLanguageValue(lib.name) || code || 'Unknown';
        }
        return getLanguageValue(lang.name) || code || 'Unknown';
      })
      .join(', ');
  };

  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/20 text-warning border-warning/30',
    approved: 'bg-success/20 text-success border-success/30',
    rejected: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
  };

  const handleEditCourse = (request: ApiTeacherCourse) => {
    if (request.status === 'approved') {
      toast({
        title: 'Cannot Edit',
        description: 'Approved course requests cannot be edited. Please contact admin.',
        variant: 'destructive',
      });
      return;
    }

    setEditingId(request._id);
    const existingLanguages = Array.isArray((request as any).languages) ? (request as any).languages : [];
    const languagesWithProf: LanguageWithProficiency[] =
      existingLanguages.length > 0
        ? existingLanguages
            .map((lang: any) => ({
              code: (lang?.code || '').toString(),
              proficiency: (lang?.proficiency || 'native') as ProficiencyLevel,
            }))
            .filter((l) => !!l.code)
        : Array.isArray(request.languageProficiencies) && request.languageProficiencies.length > 0
          ? request.languageProficiencies
              .map((lp) => ({
                code: (lp?.code || '').toString(),
                proficiency: (lp?.proficiency || 'native') as ProficiencyLevel,
              }))
              .filter((l) => !!l.code)
          : Array.isArray(request.languageIds)
            ? request.languageIds
                .map((lang: any) =>
                  typeof lang === 'object' && lang.code
                    ? ({ code: lang.code, proficiency: 'native' as ProficiencyLevel })
                    : null
                )
                .filter(Boolean) as LanguageWithProficiency[]
            : [];
    
    setFormData({
      languages: languagesWithProf,
      // Teacher input pricing (not student-converted)
      price: (typeof request?.pricing?.teacherPrice === 'number' ? request.pricing.teacherPrice : 0)?.toString() || '',
      currency: (request?.pricing?.teacherCurrency || 'USD'),
      introductionVideo: request.introductionVideo || '',
      experience: getLanguageValue(request.experience) || '',
      bio: getLanguageValue(request.bio) || '',
      aboutCourse: getLanguageValue(request.aboutCourse) || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!editingId) return;

    if (formData.languages.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one language',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payloadLanguages = formData.languages.map((l) => {
        const lib = languages.find((x) => x.code === l.code);
        return {
          ...l,
          name: lib?.name,
          nativeName: lib?.nativeName,
        };
      });

      await TeacherCourseJoinAPI.updateCourse(editingId, {
        languageCodes: formData.languages.map((l) => l.code),
        languages: payloadLanguages,
        teacherPrice: parseFloat(formData.price),
        teacherCurrency: formData.currency,
        introductionVideo: formData.introductionVideo,
        experience: formData.experience,
        bio: formData.bio,
        aboutCourse: formData.aboutCourse,
      });
      toast({
        title: 'Success',
        description: 'Course request updated successfully',
      });
      setEditDialogOpen(false);
      setEditingId(null);
      loadMyCourses();
    } catch (err: any) {
      toast({
        title: 'Failed to update course',
        description: err?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const libraryLanguageByCode = useMemo(() => {
    const map = new Map<string, any>();
    languages.forEach((l) => {
      if (l?.code) {
        const code = String(l.code);
        map.set(code, l);
        map.set(code.toLowerCase(), l);
        map.set(code.toUpperCase(), l);
      }
    });
    return map;
  }, [languages]);

  const selectedLanguageLabel = useMemo(() => {
    if (formData.languages.length === 0) return "Select languages...";
    const names = formData.languages
      .map((l) => {
        const lang = libraryLanguageByCode.get(l.code);
        return lang ? getLanguageValue(lang.name) : l.code;
      })
      .filter(Boolean);

    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
  }, [formData.languages, libraryLanguageByCode]);

  const handleExitCourse = async (id: string) => {
    const confirmed = await confirm({
      title: 'Exit Course',
      description: 'Are you sure you want to exit from this course? This action cannot be undone.',
      confirmText: 'Exit',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }

    setExitingId(id);
    try {
      await TeacherCourseJoinAPI.exitCourse(id);
      toast({ 
        title: 'Success', 
        description: 'Successfully exited from the course' 
      });
      loadMyCourses(); // Reload the list
    } catch (err: any) {
      toast({ 
        title: 'Failed to exit course', 
        description: err?.message, 
        variant: 'destructive' 
      });
    } finally {
      setExitingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Course Requests</h1>
            <p className="mt-1 text-muted-foreground">
              View the status of your course join requests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => navigate('/teacher/join-course')}>
              <Plus className="h-4 w-4 mr-2" />
              Join New Course
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : teacherCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No course requests found</p>
              <Button onClick={() => navigate('/teacher/join-course')}>
                <Plus className="h-4 w-4 mr-2" />
                Join a Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden animate-slide-up">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Course</TableHead>
                  <TableHead className="text-muted-foreground">Languages</TableHead>
                  <TableHead className="text-muted-foreground">Price</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Requested</TableHead>
                  <TableHead className="text-muted-foreground">Reviewed</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherCourses.map((request) => {
                  const StatusIcon = statusIcons[request.status] || Clock;
                  const course = typeof request.courseId === 'string' ? null : request.courseId;
                  return (
                    <TableRow key={request._id} className="border-border transition-colors hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {course?.image && (
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                              <img
                                src={course.image}
                                alt={getCourseName(request.courseId)}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{getCourseName(request.courseId)}</p>
                            {request.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{getLanguageValue(request.bio)}</p>
                            )}
                            {request.introductionVideo && (
                              <a
                                href={request.introductionVideo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              >
                                <Video className="h-3 w-3" />
                                Watch Introduction Video
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray((request as any).languages) && (request as any).languages.length > 0 ? (
                            (request as any).languages.map(
                              (
                                lang: {
                                  code?: string;
                                  name?: string;
                                  proficiency?: string;
                                },
                                idx: number
                              ) => {
                                const displayName = lang.name || lang.code || 'Unknown';
                                const profLabel = getProficiencyLabel(lang.proficiency);
                                return (
                                  <Badge key={idx} variant="outline">
                                    {displayName}
                                    {profLabel ? ` (${profLabel})` : ''}
                                  </Badge>
                                );
                              }
                            )
                          ) : Array.isArray(request.languageIds) ? (
                            request.languageIds.map((lang, idx) => {
                              const langName =
                                typeof lang === 'string'
                                  ? 'Unknown'
                                  : getLanguageValue(lang.name) || lang.code || 'Unknown';
                              return (
                                <Badge key={idx} variant="outline">
                                  {langName}
                                </Badge>
                              );
                            })
                          ) : (
                            <Badge variant="outline">Unknown</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {request?.pricing?.teacherCurrency || 'USD'}{' '}
                          {typeof request?.pricing?.teacherPrice === 'number'
                            ? request.pricing.teacherPrice.toFixed(2)
                            : '0.00'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('border capitalize flex items-center gap-1 w-fit', statusStyles[request.status] || 'bg-muted')}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.reviewedAt ? (
                          <div>
                            <div>{new Date(request.reviewedAt).toLocaleDateString()}</div>
                            {request.rejectionReason && (
                              <div className="text-xs text-destructive mt-1 italic">
                                {request.rejectionReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {request.status !== 'approved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCourse(request)}
                              disabled={editingId === request._id}
                              className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExitCourse(request._id)}
                            disabled={exitingId === request._id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            {exitingId === request._id ? 'Exiting...' : 'Exit'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <ConfirmDialog />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course Request</DialogTitle>
            <DialogDescription>
              Update your course request details. Note: Approved requests cannot be edited.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Languages */}
            <div className="space-y-2">
              <Label>Languages *</Label>
              <Popover open={languagesOpen} onOpenChange={setLanguagesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    <span className="truncate">{selectedLanguageLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search languages..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {languages.map((lang) => {
                          const code = lang.code || '';
                          const isSelected = formData.languages.some((l) => l.code === code);
                          return (
                            <CommandItem
                              key={code}
                              value={code}
                              onSelect={() => {
                                if (isSelected) {
                                  setFormData({
                                    ...formData,
                                    languages: formData.languages.filter((l) => l.code !== code),
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    languages: [...formData.languages, { code, proficiency: 'native' }],
                                  });
                                  setSelectedLanguageForProficiency(code);
                                  setProficiencyDialogOpen(true);
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                className="mr-2 h-4 w-4"
                                checked={isSelected}
                                readOnly
                              />
                              <span className="truncate">{getLanguageValue(lang.name)}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({lang.code})</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.languages.map((lw) => {
                    const lang = libraryLanguageByCode.get(lw.code);
                    if (!lang) return null;
                    const prof = PROFICIENCY_LEVELS.find((p) => p.value === lw.proficiency);
                    return (
                      <Badge key={lw.code} variant="secondary" className="flex items-center gap-1">
                        {getLanguageValue(lang.name)}
                        <button
                          type="button"
                          className="ml-1 text-xs underline underline-offset-2 opacity-80 hover:opacity-100"
                          onClick={() => {
                            setSelectedLanguageForProficiency(lw.code);
                            setProficiencyDialogOpen(true);
                          }}
                        >
                          {prof?.label || 'Native'}
                        </button>
                        <button
                          className="ml-1 hover:text-destructive"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              languages: formData.languages.filter((l) => l.code !== lw.code),
                            });
                          }}
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (USD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {formData.currency || "Select currency..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search currency..." />
                      <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                          {currencies.map((curr) => (
                            <CommandItem
                              key={curr.code}
                              value={curr.code}
                              onSelect={() => {
                                setFormData({ ...formData, currency: curr.code });
                                setCurrencyOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.currency === curr.code ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {curr.code} - {curr.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Introduction Video */}
            <div className="space-y-2">
              <Label>Introduction Video URL</Label>
              <Input
                type="url"
                value={formData.introductionVideo}
                onChange={(e) => setFormData({ ...formData, introductionVideo: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label>Experience</Label>
              <Textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Describe your teaching experience..."
                rows={3}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell students about yourself..."
                rows={4}
              />
            </div>

            {/* About Course */}
            <div className="space-y-2">
              <Label>About Course</Label>
              <Textarea
                value={formData.aboutCourse}
                onChange={(e) => setFormData({ ...formData, aboutCourse: e.target.value })}
                placeholder="Describe what you'll teach in this course..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proficiency Selection Dialog */}
      <Dialog open={proficiencyDialogOpen} onOpenChange={setProficiencyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Proficiency</DialogTitle>
            <DialogDescription>
              Choose your proficiency level for the selected language.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {PROFICIENCY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                className="w-full text-left px-3 py-2 rounded-md border hover:bg-muted transition-colors"
                onClick={() => {
                  if (!selectedLanguageForProficiency) return;
                  setFormData((prev) => ({
                    ...prev,
                    languages: prev.languages.map((l) =>
                      l.code === selectedLanguageForProficiency ? { ...l, proficiency: level.value } : l
                    ),
                  }));
                  setProficiencyDialogOpen(false);
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default TeacherMyCoursesPage;


