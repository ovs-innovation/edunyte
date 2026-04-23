import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter } from 'lucide-react';
import { CoursesAPI, ApiCourse, CategoriesAPI, ApiCategory } from '@/lib/api';
import { getLanguageValue, normalizeLanguageValue } from '@/lib/languageHelper';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CloudinaryImageUploader } from '@/components/ui/cloudinary-image-uploader';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useRole } from '@/contexts/RoleContext';

// Helper function to generate slug preview from text
const generateSlugPreview = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, ''); // Trim hyphens from end
};

const CourseManagementPage = () => {
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<ApiCourse | null>(null);
  const { currentRole } = useRole();
  const isAdmin = currentRole === 'admin' || currentRole === 'super_admin';
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: '',
    status: (isAdmin ? 'active' : 'pending') as 'active' | 'inactive' | 'pending',
  });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await CoursesAPI.list();
      setCourses(data.courses || []);
    } catch (err: any) {
      toast({ title: 'Failed to load courses', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await CategoriesAPI.list('active');
      setCategories(data.categories || []);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadCategories();
  }, []);

  const handleOpenDialog = (course?: ApiCourse) => {
    if (course) {
      setEditCourse(course);
      setFormData({
        name: getLanguageValue(course.name),
        description: getLanguageValue(course.description),
        category: course.category || '',
        image: course.image || '',
        status: course.status,
      });
    } else {
      setEditCourse(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        image: '',
        status: 'active',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditCourse(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      image: '',
      status: 'active',
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        name: normalizeLanguageValue(formData.name),
        description: normalizeLanguageValue(formData.description),
      };
      if (editCourse) {
        await CoursesAPI.update(editCourse._id, payload);
        toast({ title: 'Course updated successfully' });
      } else {
        await CoursesAPI.create(payload);
        toast({ title: 'Course created successfully' });
      }
      handleCloseDialog();
      loadCourses();
    } catch (err: any) {
      toast({ title: 'Operation failed', description: err?.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Course',
      description: 'Are you sure you want to delete this course? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await CoursesAPI.delete(id);
      toast({ title: 'Course deleted successfully' });
      loadCourses();
    } catch (err: any) {
      const errorMessage = err?.message || 'Delete failed';
      if (errorMessage.includes('teacher mappings')) {
        const deactivateConfirmed = await confirm({
          title: 'Cannot Delete Course',
          description: 'This course has teacher mappings. Would you like to deactivate it instead?',
          confirmText: 'Deactivate',
          cancelText: 'Cancel',
          variant: 'default',
        });
        if (deactivateConfirmed) {
          try {
            const course = courses.find(c => c._id === id);
            if (course) {
              await CoursesAPI.update(id, {
                name: getLanguageValue(course.name),
                description: getLanguageValue(course.description),
                category: course.category,
                image: course.image,
                status: 'inactive',
              });
              toast({ title: 'Course deactivated successfully' });
              loadCourses();
            }
          } catch (updateErr: any) {
            toast({ title: 'Deactivation failed', description: updateErr?.message, variant: 'destructive' });
          }
        }
      } else {
        toast({ title: 'Delete failed', description: errorMessage, variant: 'destructive' });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Course Management</h1>
            <p className="mt-1 text-muted-foreground">
              Create and manage courses. Teachers can join these courses to teach.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <PermissionGate permission="reports.export">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </PermissionGate>
            <PermissionGate permission="courses.create">
              <Button
                size="sm"
                className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden animate-slide-up">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Course</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Created</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-16 w-16 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading && courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No courses found
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                courses.map((course) => (
                  <TableRow key={course._id} className="border-border transition-colors hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.image && (
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <img
                              src={course.image}
                              alt={getLanguageValue(course.name)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{getLanguageValue(course.name)}</p>
                          {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{getLanguageValue(course.description)}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.category ? (
                        <Badge variant="outline">{course.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'border capitalize',
                          course.status === 'active'
                            ? 'bg-success/20 text-success border-success/30'
                            : course.status === 'pending'
                            ? 'bg-warning/20 text-warning border-warning/30'
                            : 'bg-muted text-muted-foreground border-muted'
                        )}
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <PermissionGate permission="courses.edit">
                            <DropdownMenuItem onClick={() => handleOpenDialog(course)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </PermissionGate>
                          <PermissionGate permission="courses.delete">
                            <DropdownMenuItem
                              onClick={() => handleDelete(course._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
            <DialogDescription>
              {editCourse ? 'Update course details' : 'Add a new course that teachers can join'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Yoga Class"
              />
              {formData.name && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Slug preview:</span>{' '}
                  <code className="bg-muted px-1.5 py-0.5 rounded">
                    {generateSlugPreview(formData.name)}
                  </code>
                  <span className="ml-2 text-xs">(auto-generated on save)</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const categoryName = getLanguageValue(category.name);
                    return (
                      <SelectItem key={category._id} value={categoryName}>
                        {categoryName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {formData.category && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{formData.category}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, category: '' })}
                    className="h-6 px-2 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Select a category from the list. To add new categories, go to{' '}
                <a href="/categories" className="text-primary hover:underline">
                  Category Management
                </a>
                .
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Course Image</Label>
              <CloudinaryImageUploader
                imageUrl={formData.image}
                onImageChange={(url) => setFormData({ ...formData, image: url || "" })}
                folder="courses"
                maxSize={5 * 1024 * 1024}
              />
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'pending' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
              {editCourse ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </AdminLayout>
  );
};

export default CourseManagementPage;


