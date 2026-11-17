import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, Trash2, Edit, BookOpen, Languages, ChevronLeft, ChevronRight } from 'lucide-react';
import { AvailabilityAPI, TeacherCourseJoinAPI, ApiAvailability, ApiTeacherCourse, ApiCourse } from '@/lib/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth } from 'date-fns';
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
import { getAllTimezones, getUserTimezone } from '@/utils/timezoneData';

const TeacherAvailabilityPage = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [teacherCourses, setTeacherCourses] = useState<ApiTeacherCourse[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [availabilities, setAvailabilities] = useState<ApiAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [timezones] = useState(() => getAllTimezones());
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    duration: 50,
    timezone: getUserTimezone(),
  });
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

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
      const coursesData = await TeacherCourseJoinAPI.getMyCourses('approved');
      setTeacherCourses(coursesData.teacherCourses || []);
      
      // Get unique courses (not course+language combinations)
      const uniqueCourses = Array.from(
        new Map(
          coursesData.teacherCourses
            .filter(tc => typeof tc.courseId !== 'string')
            .map(tc => {
              const course = tc.courseId as ApiCourse;
              return [course._id, course];
            })
        ).values()
      );
      setCourses(uniqueCourses);
      if (uniqueCourses.length > 0) {
        setSelectedCourseId(uniqueCourses[0]._id);
        loadAvailability(uniqueCourses[0]._id);
      }
    } catch (err: any) {
      toast({ title: 'Failed to load data', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async (courseId: string) => {
    try {
      const data = await AvailabilityAPI.getMyAvailability({ courseId });
      setAvailabilities(data.availabilities || []);
    } catch (err: any) {
      toast({ title: 'Failed to load availability', description: err?.message, variant: 'destructive' });
    }
  };

  const handleOpenDialog = (date?: Date) => {
    if (!selectedCourseId) {
      toast({ title: 'Please select a course first', variant: 'destructive' });
      return;
    }
    const dateToUse = date || selectedDate;
    setFormData({
      date: format(dateToUse, 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      duration: 50,
      timezone: getUserTimezone(),
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      date: '',
      startTime: '',
      endTime: '',
      duration: 50,
      timezone: getUserTimezone(),
    });
  };

  // Calculate teacher price for selected duration
  const selectedTeacherCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return (
      teacherCourses.find(
        (tc) => typeof tc.courseId !== 'string' && tc.courseId._id === selectedCourseId
      ) || null
    );
  }, [selectedCourseId, teacherCourses]);

  const calculatePricePreview = () => {
    if (!selectedCourseId || !formData.duration) return null;
    
    if (!selectedTeacherCourse) return null;
    
    const durationInHours = formData.duration / 60;
    const teacherPricePerHour = selectedTeacherCourse.pricing?.teacherPrice || 0;
    const teacherPriceForSession = teacherPricePerHour * durationInHours;

    return {
      price: parseFloat(teacherPriceForSession.toFixed(2)),
      currency: selectedTeacherCourse.pricing?.teacherCurrency || 'USD',
    };
  };

  const pricePreview = calculatePricePreview();

  const getSlotTeacherPriceLabel = (slot: ApiAvailability) => {
    const baseAmountUSD = slot?.pricing?.baseAmountUSD;
    if (typeof baseAmountUSD !== 'number') return '';
    if (selectedTeacherCourse?.pricing?.exchangeRateAtCreation && selectedTeacherCourse?.pricing?.teacherCurrency) {
      const amount = baseAmountUSD * selectedTeacherCourse.pricing.exchangeRateAtCreation;
      return `${selectedTeacherCourse.pricing.teacherCurrency} ${amount.toFixed(2)}`;
    }
    return `₹${(baseAmountUSD * 83.33).toFixed(2)}`;
  };

  const addMinutesToTime = (time: string, minutesToAdd: number) => {
    // time: "HH:mm"
    const [hh, mm] = time.split(':').map((v) => parseInt(v, 10));
    if (!Number.isFinite(hh) || !Number.isFinite(mm) || !Number.isFinite(minutesToAdd)) return '';
    const total = hh * 60 + mm + minutesToAdd;
    const normalized = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
    const newH = Math.floor(normalized / 60);
    const newM = normalized % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  // Keep endTime in sync with startTime + duration
  useEffect(() => {
    if (!formData.startTime || !formData.duration) {
      if (formData.endTime) {
        setFormData((prev) => ({ ...prev, endTime: '' }));
      }
      return;
    }
    const computedEndTime = addMinutesToTime(formData.startTime, formData.duration);
    if (computedEndTime && computedEndTime !== formData.endTime) {
      setFormData((prev) => ({ ...prev, endTime: computedEndTime }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startTime, formData.duration]);

  const handleSubmit = async () => {
    const computedEndTime =
      formData.startTime && formData.duration ? addMinutesToTime(formData.startTime, formData.duration) : '';

    if (!selectedCourseId || !formData.date || !formData.startTime || !computedEndTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await AvailabilityAPI.create({
        courseId: selectedCourseId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: computedEndTime,
        duration: formData.duration,
        timezone: formData.timezone,
      });
      toast({ title: 'Availability slot created successfully' });
      handleCloseDialog();
      loadAvailability(selectedCourseId);
    } catch (err: any) {
      toast({ title: 'Creation failed', description: err?.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Availability Slot',
      description: 'Are you sure you want to delete this availability slot?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await AvailabilityAPI.delete(id);
      toast({ title: 'Slot deleted successfully' });
      loadAvailability(selectedCourseId);
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err?.message, variant: 'destructive' });
    }
  };

  const getCourseName = (course: ApiTeacherCourse['courseId']) => {
    if (typeof course === 'string') return 'Unknown';
    return getLanguageValue(course.name) || 'Unknown';
  };

  const getLanguageNames = (languages: ApiTeacherCourse['languageIds']) => {
    if (!Array.isArray(languages)) return 'Unknown';
    return languages.map(lang => {
      if (typeof lang === 'string') return 'Unknown';
      return getLanguageValue(lang.name) || lang.code || 'Unknown';
    }).join(', ');
  };

  const statusStyles: Record<string, string> = {
    available: 'bg-success/20 text-success border-success/30',
    booked: 'bg-primary/20 text-primary border-primary/30',
    blocked: 'bg-muted text-muted-foreground border-muted',
    cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  // Group availabilities by date
  const groupedByDate = availabilities.reduce((acc, slot) => {
    const dateKey = format(new Date(slot.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, ApiAvailability[]>);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDates = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getSlotsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return groupedByDate[dateKey] || [];
  };

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  const getDisplayLanguageName = (lang: any): string => {
    if (!lang) return 'Unknown';
    if (typeof lang === 'string') return lang;

    if (typeof lang.name === 'string' && lang.name.trim()) return lang.name;
    if (typeof lang.nativeName === 'string' && lang.nativeName.trim()) return lang.nativeName;

    const nameFromObj = getLanguageValue(lang.name);
    if (nameFromObj) return nameFromObj;

    return (lang.code || 'Unknown') as string;
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Manage Availability</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Set your available time slots for each course. Availability slots are shared across all languages for a course.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/my-courses')}
              className="flex-1 sm:flex-initial h-9 px-3 sm:px-4 text-xs sm:text-sm"
            >
              <BookOpen className="h-4 w-4 mr-1.5 sm:mr-2" />
              My Courses
            </Button>
            <Button
              onClick={() => handleOpenDialog()}
              disabled={!selectedCourseId}
              className="flex-1 sm:flex-initial h-9 px-3 sm:px-4 text-xs sm:text-sm gradient-primary text-primary-foreground whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1.5 sm:mr-2" />
              Add Time Slot
            </Button>
          </div>
        </div>

        {/* Course Selector */}
        {!loading && courses.length > 0 && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Select Course</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Availability slots are shared across all languages for the selected course
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <Select
                value={selectedCourseId}
                onValueChange={(value) => {
                  setSelectedCourseId(value);
                  loadAvailability(value);
                }}
              >
                <SelectTrigger className="w-full h-11 px-3 text-left [&>span]:flex [&>span]:items-center [&>span]:w-full [&>span]:min-w-0 [&>span]:line-clamp-none">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]">
                  {courses.map((course) => {
                    // Get all languages for this course from joined teacherCourses
                    const courseLanguages = teacherCourses
                      .filter((tc) => typeof tc.courseId !== 'string' && tc.courseId._id === course._id)
                      .flatMap((tc) => {
                        const langs =
                          Array.isArray((tc as any).languages) && (tc as any).languages.length > 0
                            ? (tc as any).languages
                            : Array.isArray(tc.languageIds)
                              ? tc.languageIds
                              : [];
                        return langs.map((l: any) => getDisplayLanguageName(l));
                      });
                    const uniqueLanguages = Array.from(new Set(courseLanguages));

                    return (
                      <SelectItem key={course._id} value={course._id} className="py-2.5">
                        <div className="flex items-center justify-between gap-2 w-full min-w-0">
                          <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                            <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                            <span className="font-medium text-sm truncate">{getLanguageValue(course.name)}</span>
                          </div>
                          {uniqueLanguages.length > 0 && (
                            <Badge variant="secondary" className="shrink-0 text-[10px] sm:text-xs px-1.5 py-0.5 font-normal whitespace-nowrap">
                              {uniqueLanguages.length} <span className="hidden sm:inline">{uniqueLanguages.length === 1 ? 'language' : 'languages'}</span><span className="sm:hidden">lang{uniqueLanguages.length > 1 ? 's' : ''}</span>
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedCourseId && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-start sm:items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
                      <span className="font-semibold text-foreground shrink-0">Course:</span>
                      <span className="text-muted-foreground break-words flex-1 min-w-0">
                        {courses.find(c => c._id === selectedCourseId) ? getLanguageValue(courses.find(c => c._id === selectedCourseId)!.name) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Languages className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Languages:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {teacherCourses
                          .filter((tc) => typeof tc.courseId !== 'string' && tc.courseId._id === selectedCourseId)
                          .flatMap((tc) => {
                            const langs =
                              Array.isArray((tc as any).languages) && (tc as any).languages.length > 0
                                ? (tc as any).languages
                                : Array.isArray(tc.languageIds)
                                  ? tc.languageIds
                                  : [];
                            return langs.map((l: any) => getDisplayLanguageName(l));
                          })
                          .filter((v, i, a) => a.indexOf(v) === i)
                          .map((lang, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && courses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No approved courses found</p>
              <p className="text-sm text-muted-foreground mb-4">
                Join a course and wait for admin approval to set availability
              </p>
              <Button onClick={() => navigate('/teacher/join-course')}>
                <Plus className="h-4 w-4 mr-2" />
                Join a Course
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Availability View */}
        {!loading && selectedCourseId && (
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}>
            <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              {/* Week Navigation */}
              <Card>
                <CardContent className="p-2.5 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                    <span className="text-lg sm:text-xl font-bold text-center sm:text-left order-1 sm:order-2">
                      {format(selectedDate, 'MMMM yyyy')}
                    </span>
                    <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 order-2 sm:order-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(addMonths(selectedDate, -1))}
                        className="flex-1 sm:flex-initial h-8 px-2 sm:px-3 text-xs"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 sm:mr-1 shrink-0" />
                        <span className="hidden sm:inline">Previous Month</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(new Date())}
                        className="flex-1 sm:flex-initial h-8 px-2 sm:px-3 text-xs"
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                        className="flex-1 sm:flex-initial h-8 px-2 sm:px-3 text-xs"
                      >
                        <span className="hidden sm:inline">Next Month</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="h-3.5 w-3.5 sm:ml-1 shrink-0" />
                      </Button>
                    </div>
                  </div>

                  {/* Day Names Header */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                    {dayNames.map((day) => (
                      <div key={day} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground uppercase">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Month Grid */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarDates.map((date) => {
                      const slots = getSlotsForDate(date);
                      const isToday = isSameDay(date, new Date());
                      const isCurrentMonth = isSameMonth(date, monthStart);
                      return (
                        <div
                          key={date.toISOString()}
                          onClick={() => handleOpenDialog(date)}
                          className={cn(
                            'border rounded-md sm:rounded-lg p-1 sm:p-2 min-h-[58px] sm:min-h-[100px] flex flex-col group cursor-pointer transition-all hover:border-primary active:scale-95',
                            isToday && 'border-primary shadow-sm bg-primary/5',
                            !isCurrentMonth && 'opacity-35 bg-muted/20'
                          )}
                        >
                          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                            <span className={cn(
                              'text-xs sm:text-sm font-medium h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full',
                              isToday && 'bg-primary text-primary-foreground',
                              !isCurrentMonth && 'text-muted-foreground'
                            )}>
                              {format(date, 'd')}
                            </span>
                            {slots.length > 0 && (
                              <Badge variant="secondary" className="h-3.5 sm:h-4 px-1 text-[9px] sm:text-[10px] font-semibold">
                                {slots.length}
                              </Badge>
                            )}
                          </div>

                          {/* Slot display: dots on mobile, pills on tablet/desktop */}
                          <div className="flex-1 overflow-hidden">
                            {/* Mobile Dot Indicators */}
                            <div className="sm:hidden flex flex-wrap justify-center gap-1 mt-1">
                              {slots.slice(0, 3).map((slot) => (
                                <span
                                  key={slot._id}
                                  className={cn(
                                    'h-1.5 w-1.5 rounded-full shrink-0',
                                    slot.status === 'booked' ? 'bg-primary' : 'bg-emerald-500'
                                  )}
                                  title={`${slot.startTime} (${slot.status})`}
                                />
                              ))}
                              {slots.length > 3 && (
                                <span className="text-[8px] text-muted-foreground leading-none">
                                  +{slots.length - 3}
                                </span>
                              )}
                            </div>

                            {/* Desktop Slot Pills */}
                            <div className="hidden sm:block space-y-1 max-h-[75px] overflow-y-auto scrollbar-hide">
                              {slots.map((slot) => (
                                <div
                                  key={slot._id}
                                  className={cn(
                                    'text-[10px] p-0.5 rounded border leading-tight truncate',
                                    statusStyles[slot.status] || 'bg-muted'
                                  )}
                                >
                                  {slot.startTime}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Desktop plus button */}
                          <div className="hidden sm:block">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-5 mt-1 text-[10px] opacity-0 group-hover:opacity-100 hover:bg-primary/10 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(date);
                              }}
                            >
                              <Plus className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile Legend & Tap Hint */}
                  <div className="sm:hidden flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border mt-3 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span>Booked</span>
                      </div>
                    </div>
                    <span className="opacity-75 italic">Tap date to add slot</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              {availabilities.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No availability slots set</p>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Slot
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
                  {availabilities
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((slot) => (
                      <Card key={slot._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="p-3.5 sm:p-6 pb-2 sm:pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-base sm:text-lg">
                                {format(new Date(slot.date), 'EEE, MMM d, yyyy')}
                              </CardTitle>
                              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn('border capitalize shrink-0 text-xs', statusStyles[slot.status] || 'bg-muted')}
                            >
                              {slot.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-6 pt-0 sm:pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">{slot.duration} mins</span>
                            </div>
                            {slot?.pricing?.baseAmountUSD !== undefined && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-semibold text-primary">{getSlotTeacherPriceLabel(slot)}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Timezone:</span>
                              <span className="font-medium">{slot.timezone}</span>
                            </div>
                            {slot.status === 'available' && (
                              <div className="flex gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:flex-1"
                                  onClick={() => handleDelete(slot._id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Add Availability Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add Availability Slot</DialogTitle>
            <DialogDescription>
              Set a time slot when you're available for this course-language combination.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 minutes</SelectItem>
                  <SelectItem value="50">50 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" value={formData.endTime} readOnly disabled />
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

            {/* Price Preview - Teacher Price Only */}
            {pricePreview && (
              <div className="p-4 bg-muted/50 rounded-lg border-2 border-muted">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Price ({formData.duration} min)</p>
                  <p className="text-lg font-semibold text-primary mt-1">
                    {pricePreview.currency} {pricePreview.price.toFixed(2)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
                  This is your price for this {formData.duration}-minute session.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.date || !formData.startTime} className="w-full sm:w-auto">
              Create Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </AdminLayout>
  );
};

export default TeacherAvailabilityPage;
