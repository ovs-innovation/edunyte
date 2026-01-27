import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, XCircle, Clock, Plus, Video, ExternalLink, LogOut, Edit } from 'lucide-react';
import { TeacherCourseJoinAPI, ApiTeacherCourse, LanguagesAPI } from '@/lib/api';
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
import { getCurrencies } from '@/utils/countryData';
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
    languageIds: [] as string[],
    price: '',
    currency: 'USD',
    introductionVideo: '',
    experience: '',
    bio: '',
    aboutCourse: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (currentRole !== 'teacher') {
      navigate('/');
      return;
    }
    loadMyCourses();
    loadLanguages();
  }, [currentRole, filterStatus]);

  const loadLanguages = async () => {
    try {
      const data = await LanguagesAPI.list();
      setLanguages(data.languages || []);
    } catch (err) {
      console.error('Failed to load languages:', err);
    }
  };

  const loadMyCourses = async () => {
    setLoading(true);
    try {
      const status = filterStatus !== 'all' ? filterStatus : undefined;
      const data = await TeacherCourseJoinAPI.getMyCourses(status);
      setTeacherCourses(data.teacherCourses || []);
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

  const getLanguageNames = (languages: ApiTeacherCourse['languageIds']) => {
    if (!Array.isArray(languages)) return 'Unknown';
    return languages.map(lang => {
      if (typeof lang === 'string') return 'Unknown';
      return getLanguageValue(lang.name) || lang.code || 'Unknown';
    }).join(', ');
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
    const languageIds = Array.isArray(request.languageIds)
      ? request.languageIds.map((lang: any) => (typeof lang === 'string' ? lang : lang._id))
      : [];
    
    setFormData({
      languageIds,
      price: (typeof request.originalPrice === 'number' ? request.originalPrice : request.price)?.toString() || '',
      currency: (request.teacherCurrency || request.currency || 'USD'),
      introductionVideo: request.introductionVideo || '',
      experience: getLanguageValue(request.experience) || '',
      bio: getLanguageValue(request.bio) || '',
      aboutCourse: getLanguageValue(request.aboutCourse) || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!editingId) return;

    if (formData.languageIds.length === 0) {
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
      await TeacherCourseJoinAPI.updateCourse(editingId, {
        languageIds: formData.languageIds,
        price: parseFloat(formData.price),
        currency: formData.currency,
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
                          {Array.isArray(request.languageIds) ? (
                            request.languageIds.map((lang, idx) => {
                              const langName = typeof lang === 'string' ? 'Unknown' : (getLanguageValue(lang.name) || lang.code || 'Unknown');
                              return (
                                <Badge key={idx} variant="outline">{langName}</Badge>
                              );
                            })
                          ) : (
                            <Badge variant="outline">Unknown</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {typeof request.teacherCurrency === 'string'
                            ? request.teacherCurrency
                            : (typeof request.currency === 'string' ? request.currency : 'USD')}{' '}
                          {typeof request.originalPrice === 'number'
                            ? request.originalPrice.toFixed(2)
                            : (typeof request.price === 'number' ? request.price.toFixed(2) : '0.00')}
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
                    {formData.languageIds.length > 0
                      ? `${formData.languageIds.length} language(s) selected`
                      : "Select languages..."}
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
                          const isSelected = formData.languageIds.includes(lang._id);
                          return (
                            <CommandItem
                              key={lang._id}
                              value={lang._id}
                              onSelect={() => {
                                if (isSelected) {
                                  setFormData({
                                    ...formData,
                                    languageIds: formData.languageIds.filter((id) => id !== lang._id),
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    languageIds: [...formData.languageIds, lang._id],
                                  });
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {getLanguageValue(lang.name)} ({lang.code})
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.languageIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.languageIds.map((langId) => {
                    const lang = languages.find((l) => l._id === langId);
                    if (!lang) return null;
                    return (
                      <Badge key={langId} variant="secondary">
                        {getLanguageValue(lang.name)}
                        <button
                          className="ml-1 hover:text-destructive"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              languageIds: formData.languageIds.filter((id) => id !== langId),
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
    </AdminLayout>
  );
};

export default TeacherMyCoursesPage;


