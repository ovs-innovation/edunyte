import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, Trash2, Edit, BookOpen, Languages } from 'lucide-react';
import { AvailabilityAPI, TeacherCourseJoinAPI, ApiAvailability, ApiTeacherCourse, ApiCourse } from '@/lib/api';
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
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

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
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    duration: 50,
    timezone: 'UTC',
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
      timezone: 'UTC',
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
      timezone: 'UTC',
    });
  };

  const handleSubmit = async () => {
    if (!selectedCourseId || !formData.date || !formData.startTime || !formData.endTime) {
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
        endTime: formData.endTime,
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
    return course.name || 'Unknown';
  };

  const getLanguageNames = (languages: ApiTeacherCourse['languageIds']) => {
    if (!Array.isArray(languages)) return 'Unknown';
    return languages.map(lang => {
      if (typeof lang === 'string') return 'Unknown';
      return lang.name || lang.code || 'Unknown';
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

  // Get week dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return groupedByDate[dateKey] || [];
  };

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Availability</h1>
            <p className="mt-1 text-muted-foreground">
              Set your available time slots for each course. Availability slots are shared across all languages for a course.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/teacher/my-courses')}>
              <BookOpen className="h-4 w-4 mr-2" />
              My Courses
            </Button>
            <Button onClick={() => handleOpenDialog()} disabled={!selectedCourseId}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
        </div>

        {/* Course Selector */}
        {!loading && courses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Course</CardTitle>
              <CardDescription>
                Availability slots are shared across all languages for the selected course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCourseId}
                onValueChange={(value) => {
                  setSelectedCourseId(value);
                  loadAvailability(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => {
                    // Get all languages for this course
                    const courseLanguages = teacherCourses
                      .filter(tc => typeof tc.courseId !== 'string' && tc.courseId._id === course._id)
                      .flatMap(tc => Array.isArray(tc.languageIds) ? tc.languageIds.map(l => typeof l === 'string' ? 'Unknown' : (l.name || l.code || 'Unknown')) : []);
                    const uniqueLanguages = Array.from(new Set(courseLanguages));
                    
                    return (
                      <SelectItem key={course._id} value={course._id}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-medium">{course.name}</span>
                          {uniqueLanguages.length > 0 && (
                            <Badge variant="outline" className="ml-2">
                              {uniqueLanguages.length} language{uniqueLanguages.length > 1 ? 's' : ''}
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
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Course:</span>
                      <span className="text-muted-foreground">
                        {courses.find(c => c._id === selectedCourseId)?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Languages className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Languages:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {teacherCourses
                          .filter(tc => typeof tc.courseId !== 'string' && tc.courseId._id === selectedCourseId)
                          .flatMap(tc => Array.isArray(tc.languageIds) ? tc.languageIds.map(l => typeof l === 'string' ? 'Unknown' : (l.name || l.code || 'Unknown')) : [])
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
            <TabsList>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              {/* Week Navigation */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                    >
                      Previous Week
                    </Button>
                    <span className="font-medium">
                      {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                    >
                      Next Week
                    </Button>
                  </div>

                  {/* Week Calendar */}
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date) => {
                      const slots = getSlotsForDate(date);
                      const isToday = isSameDay(date, new Date());
                      return (
                        <div
                          key={date.toISOString()}
                          className={cn(
                            'border rounded-lg p-3 min-h-[120px]',
                            isToday && 'border-primary bg-primary/5'
                          )}
                        >
                          <div className="text-center mb-2">
                            <div className="text-xs text-muted-foreground">
                              {format(date, 'EEE')}
                            </div>
                            <div className={cn('text-lg font-semibold', isToday && 'text-primary')}>
                              {format(date, 'd')}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {slots.map((slot) => (
                              <div
                                key={slot._id}
                                className={cn(
                                  'text-xs p-1 rounded border',
                                  statusStyles[slot.status] || 'bg-muted'
                                )}
                              >
                                <div className="font-medium">{slot.startTime}</div>
                                <div className="text-muted-foreground">{slot.duration}m</div>
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-6 text-xs"
                              onClick={() => handleOpenDialog(date)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
                  {availabilities
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((slot) => (
                      <Card key={slot._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {format(new Date(slot.date), 'EEE, MMM d, yyyy')}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn('border capitalize', statusStyles[slot.status] || 'bg-muted')}
                            >
                              {slot.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">{slot.duration} mins</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Timezone:</span>
                              <span className="font-medium">{slot.timezone}</span>
                            </div>
                            {slot.status === 'available' && (
                              <div className="flex gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
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
        <DialogContent className="sm:max-w-[500px]">
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
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
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
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="25">25 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="50">50 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.date || !formData.startTime || !formData.endTime}>
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
