import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Languages as LanguagesIcon } from 'lucide-react';
import { TeacherCourseJoinAPI, CoursesAPI, LanguagesAPI, ApiCourse, ApiLanguage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
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
import { getAllTimezones, getUserTimezone } from '@/utils/timezoneData';

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
  const [formData, setFormData] = useState({
    courseId: '',
    languageCodes: [] as string[],
    price: '',
    currency: 'INR',
    timezone: getUserTimezone(),
    introductionVideo: '',
    experience: '',
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
      const [coursesData, languagesData] = await Promise.all([
        TeacherCourseJoinAPI.getAvailableCourses(),
        TeacherCourseJoinAPI.getLanguages(),
      ]);
      setCourses(coursesData.courses || []);
      setLanguages(languagesData.languages || []);
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
      languageCodes: [],
      price: '',
      currency: 'INR',
      timezone: getUserTimezone(),
      introductionVideo: '',
      experience: '',
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
      languageCodes: [],
      price: '',
      currency: 'INR',
      timezone: getUserTimezone(),
      introductionVideo: '',
      experience: '',
      bio: '',
      aboutCourse: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.courseId || formData.languageCodes.length === 0 || !formData.price || !formData.experience || !formData.bio || !formData.aboutCourse) {
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
      // Map language codes to language IDs from API
      const languageIds = formData.languageCodes
        .map((code) => {
          // Try to match by code first (case-insensitive)
          let apiLang = languages.find((l) => l.code?.toLowerCase() === code.toLowerCase());
          // If no match by code, try to match by name
          if (!apiLang) {
            const libLang = libraryLanguages.find((l) => l.code === code);
            if (libLang) {
              apiLang = languages.find((l) => 
                l.name?.toLowerCase() === libLang.name.toLowerCase() ||
                l.nativeName?.toLowerCase() === libLang.nativeName.toLowerCase()
              );
            }
          }
          return apiLang?._id;
        })
        .filter((id): id is string => !!id);

      if (languageIds.length === 0) {
        toast({
          title: 'Invalid languages',
          description: 'Please select valid languages',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      const result = await TeacherCourseJoinAPI.joinCourse({
        courseId: formData.courseId,
        languageIds: languageIds,
        price: parseFloat(formData.price),
        currency: formData.currency,
        timezone: formData.timezone,
        introductionVideo: formData.introductionVideo,
        experience: formData.experience,
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
                        alt={course.name}
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
                      <CardTitle className="text-lg line-clamp-1">{course.name}</CardTitle>
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
                    {course.description || 'No description available'}
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
            <DialogTitle>Join Course: {selectedCourse?.name}</DialogTitle>
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
                      {formData.languageCodes.length === 0
                        ? 'Select languages...'
                        : `${formData.languageCodes.length} language${formData.languageCodes.length > 1 ? 's' : ''} selected`}
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
                          const isSelected = formData.languageCodes.includes(lang.code);
                          return (
                            <CommandItem
                              key={lang.code}
                              value={`${lang.code} ${lang.name} ${lang.nativeName || ''}`}
                              onSelect={(e) => {
                                e.preventDefault();
                                if (isSelected) {
                                  setFormData({ ...formData, languageCodes: formData.languageCodes.filter(code => code !== lang.code) });
                                } else {
                                  setFormData({ ...formData, languageCodes: [...formData.languageCodes, lang.code] });
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
                                <span className="font-medium">{lang.name}</span>
                                {lang.nativeName && lang.nativeName !== lang.name && (
                                  <span className="text-muted-foreground text-sm">({lang.nativeName})</span>
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
              {formData.languageCodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.languageCodes.map((code) => {
                    const lang = libraryLanguages.find((l) => l.code === code);
                    return lang ? (
                      <Badge key={code} variant="secondary" className="text-xs">
                        {lang.name}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, languageCodes: formData.languageCodes.filter(c => c !== code) });
                          }}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
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
              <Label htmlFor="timezone">Timezone</Label>
              <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={timezoneOpen}
                    className="w-full justify-between"
                  >
                    <span>
                      {formData.timezone
                        ? timezones.find((tz) => tz.value === formData.timezone)?.label || formData.timezone
                        : 'Select timezone...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search timezone..." />
                    <CommandList>
                      <CommandEmpty>No timezone found.</CommandEmpty>
                      <CommandGroup>
                        {timezones.map((tz) => (
                          <CommandItem
                            key={tz.value}
                            value={`${tz.value} ${tz.label}`}
                            onSelect={() => {
                              setFormData({ ...formData, timezone: tz.value });
                              setTimezoneOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.timezone === tz.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <span>{tz.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience / Qualifications *</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 5 years of teaching experience, Certified Yoga Instructor, TEFL Certified..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Describe your experience and qualifications specific to this course.
              </p>
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
              <p className="text-xs text-muted-foreground">
                Add a video link (YouTube, Vimeo, etc.) explaining what you will teach in this course. This helps students understand your teaching style.
              </p>
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
              <p className="text-xs text-muted-foreground">
                Provide a detailed description of what students will learn, how you will teach, course structure, and what makes your teaching unique for this course.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || formData.languageCodes.length === 0 || !formData.price || !formData.experience || !formData.bio || !formData.aboutCourse}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default TeacherJoinCoursePage;


