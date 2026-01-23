import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell,
  Plus,
  Send,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'course' | 'maintenance' | 'promotion';
  targetAudience: 'all' | 'students' | 'teachers' | 'specific_course';
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  views: number;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

const mockAnnouncements: Announcement[] = [
  {
    id: 'ANN-001',
    title: 'New Course Launch: Advanced Machine Learning',
    message: 'We are excited to announce the launch of our new Advanced Machine Learning course. Enroll now to get early bird discounts!',
    type: 'promotion',
    targetAudience: 'all',
    status: 'sent',
    sentAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-14T15:30:00Z',
    views: 1250,
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    id: 'ANN-002',
    title: 'Scheduled Maintenance - January 20th',
    message: 'The platform will be undergoing maintenance on January 20th from 2:00 AM to 6:00 AM UTC. Some features may be temporarily unavailable.',
    type: 'maintenance',
    targetAudience: 'all',
    status: 'scheduled',
    scheduledAt: '2024-01-19T08:00:00Z',
    createdAt: '2024-01-15T11:00:00Z',
    views: 0,
    pushEnabled: true,
    emailEnabled: false,
  },
  {
    id: 'ANN-003',
    title: 'Web Development Course - Assignment Deadline Extended',
    message: 'The deadline for Assignment 3 has been extended to January 25th. Please submit your work before the new deadline.',
    type: 'course',
    targetAudience: 'specific_course',
    status: 'sent',
    sentAt: '2024-01-14T09:00:00Z',
    createdAt: '2024-01-14T08:45:00Z',
    views: 450,
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    id: 'ANN-004',
    title: 'Teacher Workshop - Effective Online Teaching',
    message: 'Join us for a workshop on effective online teaching strategies. Date: January 22nd at 3:00 PM UTC.',
    type: 'general',
    targetAudience: 'teachers',
    status: 'draft',
    createdAt: '2024-01-15T14:00:00Z',
    views: 0,
    pushEnabled: false,
    emailEnabled: true,
  },
];

const typeConfig = {
  general: { label: 'General', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', icon: Bell },
  course: { label: 'Course', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: BookOpen },
  maintenance: { label: 'Maintenance', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30', icon: Clock },
  promotion: { label: 'Promotion', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30', icon: GraduationCap },
};

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground border-border' },
  scheduled: { label: 'Scheduled', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  sent: { label: 'Sent', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
};

const audienceConfig = {
  all: { label: 'All Users', icon: Users },
  students: { label: 'Students Only', icon: GraduationCap },
  teachers: { label: 'Teachers Only', icon: BookOpen },
  specific_course: { label: 'Course Students', icon: BookOpen },
};

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAnnouncements = announcements.filter(
    ann => statusFilter === 'all' || ann.status === statusFilter
  );

  const counts = {
    all: announcements.length,
    draft: announcements.filter(a => a.status === 'draft').length,
    scheduled: announcements.filter(a => a.status === 'scheduled').length,
    sent: announcements.filter(a => a.status === 'sent').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Announcements</h1>
            <p className="mt-1 text-muted-foreground">
              Manage push notifications and announcements for users
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Send a notification or announcement to your users.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Announcement title" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Write your announcement message..." rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Target Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="teachers">Teachers Only</SelectItem>
                        <SelectItem value="specific_course">Specific Course</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 rounded-lg border border-border p-4">
                  <Label className="text-base">Notification Channels</Label>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push">Push Notification</Label>
                      <p className="text-sm text-muted-foreground">Send as in-app push notification</p>
                    </div>
                    <Switch id="push" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email">Email Notification</Label>
                      <p className="text-sm text-muted-foreground">Send via email to users</p>
                    </div>
                    <Switch id="email" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule">Schedule (Optional)</Label>
                  <Input id="schedule" type="datetime-local" />
                  <p className="text-xs text-muted-foreground">Leave empty to send immediately</p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline">Save as Draft</Button>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Send Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total', count: counts.all, icon: Bell, color: 'text-primary' },
            { label: 'Drafts', count: counts.draft, icon: Edit, color: 'text-muted-foreground' },
            { label: 'Scheduled', count: counts.scheduled, icon: Calendar, color: 'text-amber-500' },
            { label: 'Sent', count: counts.sent, icon: CheckCircle2, color: 'text-emerald-500' },
          ].map((stat, index) => (
            <Card
              key={stat.label}
              className="border-border bg-card p-4 animate-slide-up cursor-pointer hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setStatusFilter(stat.label.toLowerCase())}
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-2xl font-bold text-foreground">{stat.count}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label} Announcements</p>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'draft', 'scheduled', 'sent'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement, index) => {
            const TypeIcon = typeConfig[announcement.type].icon;
            const AudienceIcon = audienceConfig[announcement.targetAudience].icon;
            
            return (
              <Card
                key={announcement.id}
                className="border-border bg-card p-6 animate-slide-up hover:shadow-md transition-shadow"
                style={{ animationDelay: `${(index + 4) * 50}ms` }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline" className={typeConfig[announcement.type].color}>
                        <TypeIcon className="mr-1 h-3 w-3" />
                        {typeConfig[announcement.type].label}
                      </Badge>
                      <Badge variant="outline" className={statusConfig[announcement.status].color}>
                        {statusConfig[announcement.status].label}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <AudienceIcon className="h-3 w-3" />
                        {audienceConfig[announcement.targetAudience].label}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground">{announcement.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                    
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      {announcement.status === 'sent' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{announcement.views.toLocaleString()} views</span>
                          </div>
                          <span>•</span>
                          <span>Sent {formatDate(announcement.sentAt!)}</span>
                        </>
                      )}
                      {announcement.status === 'scheduled' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Scheduled for {formatDate(announcement.scheduledAt!)}</span>
                          </div>
                        </>
                      )}
                      {announcement.status === 'draft' && (
                        <span>Created {formatDate(announcement.createdAt)}</span>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center gap-3">
                      {announcement.pushEnabled && (
                        <Badge variant="secondary" className="text-xs">
                          <Bell className="mr-1 h-3 w-3" />
                          Push
                        </Badge>
                      )}
                      {announcement.emailEnabled && (
                        <Badge variant="secondary" className="text-xs">
                          <Send className="mr-1 h-3 w-3" />
                          Email
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {announcement.status === 'draft' && (
                      <Button size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredAnnouncements.length === 0 && (
          <Card className="border-border bg-card p-12">
            <div className="text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium text-foreground">No announcements found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first announcement to notify your users
              </p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AnnouncementsPage;
