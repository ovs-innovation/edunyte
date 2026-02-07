import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Languages as LanguagesIcon } from 'lucide-react';
import { TeacherCourseJoinAPI, CoursesAPI, LanguagesAPI, ApiCourse, ApiLanguage } from '@/lib/api';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { getCurrencies, getLanguages } from '@/utils/countryData';

// Proficiency levels
const PROFICIENCY_LEVELS = [
  { value: 'native', label: 'Native', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'c2', label: 'Proficient C2', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'c1', label: 'Advanced C1', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'b2', label: 'Upper Intermediate B2', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'b1', label: 'Intermediate B1', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'a2', label: 'Elementary A2', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  { value: 'a1', label: 'Beginner A1', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
] as const;

type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number]['value'];

interface LanguageWithProficiency {
  code: string;
  proficiency: ProficiencyLevel;
}

const TeacherJoinCoursePage = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [languages, setLanguages] = useState<ApiLanguage[]>([]);
  const [libraryLanguages] = useState(() => getLanguages());
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const [currencies] = useState(() => getCurrencies());
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
  const [proficiencyDialogOpen, setProficiencyDialogOpen] = useState(false);
  const [selectedLanguageForProficiency, setSelectedLanguageForProficiency] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    courseId: '',
    languages: [] as LanguageWithProficiency[],
    price: '',
    currency: 'INR',
    introductionVideo: '',
    bio: '',
    aboutCourse: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentRole !== 'teacher') {
      navigate('/');
      return;
    }
    loadData();
  }, [currentRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData] = await Promise.all([
        TeacherCourseJoinAPI.getAvailableCourses(),
      ]);
      setCourses(coursesData.courses || []);
    } catch (err: any) {
      toast({ title: 'Failed to load data', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course: ApiCourse) => {
    setSelectedCourse(course);
    setFormData({
      courseId: course._id,
      languages: [],
      price: '',
      currency: 'INR',
      introductionVideo: '',

      bio: '',
      aboutCourse: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCourse(null);
    setFormData({
      courseId: '',
      languages: [],
      price: '',
      currency: 'INR',
      introductionVideo: '',

      bio: '',
      aboutCourse: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.courseId || formData.languages.length === 0 || !formData.price || !formData.bio || !formData.aboutCourse) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Course, at least one Language, Price, Experience, Bio, and About Course)',
        variant: 'destructive',
      });
      return;
    }

    if (submitting) return; 

    setSubmitting(true);
    try {
      const languageCodes = formData.languages.map((l) => l.code).filter(Boolean);

      const result = await TeacherCourseJoinAPI.joinCourse({
        courseId: formData.courseId,
        languageCodes,
        languages: formData.languages.map((l) => {
          const lib = libraryLanguages.find((x) => x.code === l.code);
          return {
            ...l,
            name: lib?.name,
            nativeName: lib?.nativeName,
          };
        }),
        // Teacher pricing input (server converts once and stores USD base)
        teacherPrice: parseFloat(formData.price),
        teacherCurrency: formData.currency,
        introductionVideo: formData.introductionVideo,
        bio: formData.bio,
        aboutCourse: formData.aboutCourse,
      });
      toast({ 
        title: 'Request submitted successfully', 
        description: result.message || 'Waiting for admin approval' 
      });
      handleCloseDialog();
      navigate('/teacher/my-courses');
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Join a Course</h1>
            <p className="mt-1 text-muted-foreground">
              Select a course and language to teach. Your request will be reviewed by admin.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/teacher/my-courses')}>
            View My Requests
          </Button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
            {courses.map((course) => (
              <Card key={course._id} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                {course.image && (
                  <div className="relative w-full bg-muted px-4 pt-3">
                    <div className="relative w-full h-48 sm:h-52 md:h-60 rounded-lg overflow-hidden">
                      <img
                        src={course.image}
                        alt={getLanguageValue(course.name)}
                        className="w-full h-full object-fill rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{getLanguageValue(course.name)}</CardTitle>
                      {course.category && (
                        <Badge variant="outline" className="mt-2">
                          {course.category}
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0',
                        course.status === 'active' ? 'bg-success/20 text-success border-success/30' : ''
                      )}
                    >
                      {course.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <CardDescription className="line-clamp-2 mb-4 flex-1">
                    {getLanguageValue(course.description) || 'No description available'}
                  </CardDescription>
                  <Button
                    onClick={() => handleOpenDialog(course)}
                    className="w-full"
                    disabled={course.status !== 'active'}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Join Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Join Course Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Join Course: {selectedCourse ? getLanguageValue(selectedCourse.name) : ''}</DialogTitle>
            <DialogDescription>
              Fill in the details to request joining this course. Admin will review your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="languages">Languages *</Label>
              <Popover open={languagesOpen} onOpenChange={setLanguagesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={languagesOpen}
                    className="w-full justify-between"
                  >
                    <span>
                      {formData.languages.length === 0
                        ? 'Select languages...'
                        : (() => {
                            const names = formData.languages
                              .map((lwp) => {
                                const lang = libraryLanguages.find((l) => l.code === lwp.code);
                                return lang ? getLanguageValue(lang.name) : lwp.code;
                              })
                              .filter(Boolean);
                            const shown = names.slice(0, 2).join(', ');
                            const extra = names.length - 2;
                            return extra > 0 ? `${shown} +${extra}` : shown;
                          })()}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search languages..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {libraryLanguages.map((lang) => {
                          const isSelected = formData.languages.some((l) => l.code === lang.code);
                          return (
                            <CommandItem
                              key={lang.code}
                              value={`${lang.code} ${getLanguageValue(lang.name)} ${getLanguageValue(lang.nativeName) || ''}`}
                              onSelect={() => {
                                if (isSelected) {
                                  setFormData({ ...formData, languages: formData.languages.filter(l => l.code !== lang.code) });
                                } else {
                                  setLanguagesOpen(false);
                                  setSelectedLanguageForProficiency(lang.code);
                                  setProficiencyDialogOpen(true);
                                }
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 flex-1 w-full">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="rounded border-gray-300 cursor-pointer"
                                />
                                <span className="font-medium">{getLanguageValue(lang.name)}</span>
                                {lang.nativeName && getLanguageValue(lang.nativeName) !== getLanguageValue(lang.name) && (
                                  <span className="text-muted-foreground text-sm">({getLanguageValue(lang.nativeName)})</span>
                                )}
                              </div>
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
                  {formData.languages.map((langWithProf) => {
                    const lang = libraryLanguages.find((l) => l.code === langWithProf.code);
                    const proficiency = PROFICIENCY_LEVELS.find((p) => p.value === langWithProf.proficiency);
                    return lang ? (
                      <div key={langWithProf.code} className="flex items-center gap-1">
                        <span className="text-sm font-medium">{getLanguageValue(lang.name)}</span>
                        <Badge 
                          className={cn("text-xs", proficiency?.color)}
                          variant="secondary"
                        >
                          {proficiency?.label}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, languages: formData.languages.filter(l => l.code !== langWithProf.code) });
                          }}
                          className="ml-1 hover:text-destructive text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Select one or more languages you can teach this course in.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per Hour *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={currencyOpen}
                      className="w-full justify-between"
                    >
                      <span>
                        {formData.currency
                          ? `${formData.currency} - ${currencies.find((c) => c.code === formData.currency)?.name || formData.currency}`
                          : 'Select currency...'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search currency..." />
                      <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                          {currencies.map((currency) => (
                            <CommandItem
                              key={currency.code}
                              value={`${currency.code} ${currency.name}`}
                              onSelect={() => {
                                setFormData({ ...formData, currency: currency.code });
                                setCurrencyOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.currency === currency.code ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <span>{currency.code} - {currency.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>



            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief introduction about yourself and your teaching approach for this course..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Write a short bio specific to this course. This helps students understand your teaching style.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="introductionVideo">Introduction Video Link</Label>
              <Input
                id="introductionVideo"
                type="url"
                value={formData.introductionVideo}
                onChange={(e) => setFormData({ ...formData, introductionVideo: e.target.value })}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutCourse">About This Course *</Label>
              <Textarea
                id="aboutCourse"
                value={formData.aboutCourse}
                onChange={(e) => setFormData({ ...formData, aboutCourse: e.target.value })}
                placeholder="Describe in detail what you will teach in this course, your teaching approach, course structure, topics covered, learning outcomes, etc..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || formData.languages.length === 0 || !formData.price || !formData.bio || !formData.aboutCourse}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proficiency Selection Dialog */}
      <Dialog open={proficiencyDialogOpen} onOpenChange={setProficiencyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Proficiency Level</DialogTitle>
            <DialogDescription>
              Choose your proficiency level for {selectedLanguageForProficiency && libraryLanguages.find(l => l.code === selectedLanguageForProficiency)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {PROFICIENCY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => {
                  if (selectedLanguageForProficiency) {
                    setFormData({
                      ...formData,
                      languages: [
                        ...formData.languages.filter(l => l.code !== selectedLanguageForProficiency),
                        { code: selectedLanguageForProficiency, proficiency: level.value }
                      ]
                    });
                    setProficiencyDialogOpen(false);
                    setSelectedLanguageForProficiency(null);
                  }
                }}
                className={cn(
                  "w-full text-left p-3 rounded-md border-2 transition-colors",
                  "hover:bg-accent",
                  formData.languages.find(l => l.code === selectedLanguageForProficiency)?.proficiency === level.value
                    ? "border-primary bg-accent"
                    : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{level.label}</span>
                  <Badge className={cn("text-xs", level.color)} variant="secondary">
                    {level.label}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setProficiencyDialogOpen(false);
              setSelectedLanguageForProficiency(null);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default TeacherJoinCoursePage;


