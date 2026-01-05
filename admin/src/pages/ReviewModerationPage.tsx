import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MessageSquare,
  User,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
type ReviewType = 'course' | 'instructor';

interface Review {
  id: string;
  type: ReviewType;
  rating: number;
  title: string;
  content: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  target: {
    name: string;
    type: 'course' | 'instructor';
  };
  status: ReviewStatus;
  createdAt: string;
  helpful: number;
  reported: boolean;
  reportReason?: string;
}

const mockReviews: Review[] = [
  {
    id: 'REV-001',
    type: 'course',
    rating: 5,
    title: 'Excellent course for beginners!',
    content: 'This course exceeded my expectations. The instructor explains everything clearly and the projects are very practical. Highly recommended for anyone starting with web development.',
    user: { name: 'John Doe', email: 'john@example.com' },
    target: { name: 'Web Development Bootcamp', type: 'course' },
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    helpful: 12,
    reported: false,
  },
  {
    id: 'REV-002',
    type: 'instructor',
    rating: 4,
    title: 'Great teacher, could improve pace',
    content: 'Dr. Smith is very knowledgeable and explains concepts well. However, sometimes the pace is a bit slow. Overall, a great learning experience.',
    user: { name: 'Sarah Smith', email: 'sarah@example.com' },
    target: { name: 'Dr. Emily Smith', type: 'instructor' },
    status: 'approved',
    createdAt: '2024-01-14T14:20:00Z',
    helpful: 8,
    reported: false,
  },
  {
    id: 'REV-003',
    type: 'course',
    rating: 2,
    title: 'Not worth the money',
    content: 'The course content is outdated and the instructor barely responds to questions. I expected much better quality for the price.',
    user: { name: 'Mike Johnson', email: 'mike@example.com' },
    target: { name: 'Data Science Fundamentals', type: 'course' },
    status: 'flagged',
    createdAt: '2024-01-13T08:45:00Z',
    helpful: 3,
    reported: true,
    reportReason: 'Potentially defamatory content',
  },
  {
    id: 'REV-004',
    type: 'course',
    rating: 5,
    title: 'Life-changing course!',
    content: 'I landed my dream job after completing this course. The curriculum is comprehensive and up-to-date with industry standards.',
    user: { name: 'Emily Brown', email: 'emily@example.com' },
    target: { name: 'UI/UX Design Masterclass', type: 'course' },
    status: 'approved',
    createdAt: '2024-01-12T16:00:00Z',
    helpful: 45,
    reported: false,
  },
  {
    id: 'REV-005',
    type: 'instructor',
    rating: 1,
    title: 'Terrible experience',
    content: 'The instructor is rude and unhelpful. I asked a simple question and got a condescending response. Would not recommend.',
    user: { name: 'David Lee', email: 'david@example.com' },
    target: { name: 'Prof. James Wilson', type: 'instructor' },
    status: 'pending',
    createdAt: '2024-01-15T07:15:00Z',
    helpful: 2,
    reported: true,
    reportReason: 'Suspected spam or fake review',
  },
  {
    id: 'REV-006',
    type: 'course',
    rating: 4,
    title: 'Solid course with minor issues',
    content: 'Good content overall but some video quality could be improved. The exercises are challenging and help reinforce learning.',
    user: { name: 'Lisa Chen', email: 'lisa@example.com' },
    target: { name: 'Python Programming', type: 'course' },
    status: 'rejected',
    createdAt: '2024-01-11T11:30:00Z',
    helpful: 6,
    reported: false,
  },
];

const statusConfig: Record<ReviewStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30', icon: Clock },
  approved: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: XCircle },
  flagged: { label: 'Flagged', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30', icon: Flag },
};

const ReviewModerationPage = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesType = typeFilter === 'all' || review.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const counts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    flagged: reviews.filter(r => r.status === 'flagged').length,
  };

  const handleApprove = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, status: 'approved' as ReviewStatus } : r
    ));
  };

  const handleReject = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, status: 'rejected' as ReviewStatus } : r
    ));
    setRejectDialogOpen(false);
    setRejectReason('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Review Moderation</h1>
            <p className="mt-1 text-muted-foreground">
              Approve, reject, or flag reviews for courses and instructors
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: 'Total', count: counts.all, icon: MessageSquare, color: 'text-primary' },
            { label: 'Pending', count: counts.pending, icon: Clock, color: 'text-amber-500' },
            { label: 'Approved', count: counts.approved, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Rejected', count: counts.rejected, icon: XCircle, color: 'text-red-500' },
            { label: 'Flagged', count: counts.flagged, icon: Flag, color: 'text-orange-500' },
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
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-border bg-card p-4 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search reviews..." 
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="course">Course Reviews</SelectItem>
                  <SelectItem value="instructor">Instructor Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review, index) => {
            const StatusIcon = statusConfig[review.status].icon;
            
            return (
              <Card
                key={review.id}
                className={`border-border bg-card p-6 animate-slide-up hover:shadow-md transition-shadow ${
                  review.reported ? 'border-l-4 border-l-orange-500' : ''
                }`}
                style={{ animationDelay: `${(index + 5) * 50}ms` }}
              >
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">{review.user.name}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                          {review.reported && (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Reported
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={review.type === 'course' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' : 'bg-purple-500/10 text-purple-500 border-purple-500/30'}>
                            {review.type === 'course' ? <BookOpen className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />}
                            {review.type === 'course' ? 'Course' : 'Instructor'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{review.target.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusConfig[review.status].color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[review.status].label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedReview(review)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleApprove(review.id)} className="text-emerald-500">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedReview(review);
                              setRejectDialogOpen(true);
                            }}
                            className="text-red-500"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-orange-500">
                            <Flag className="mr-2 h-4 w-4" />
                            Flag for Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(review.rating)}
                      <span className="font-medium text-foreground">{review.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                    
                    {review.reported && review.reportReason && (
                      <div className="mt-3 rounded-lg bg-orange-500/10 border border-orange-500/30 p-3">
                        <div className="flex items-center gap-2 text-sm text-orange-500">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Report Reason:</span>
                          <span>{review.reportReason}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.helpful} found helpful</span>
                      </div>
                    </div>
                    
                    {review.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => {
                            setSelectedReview(review);
                            setRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => handleApprove(review.id)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredReviews.length === 0 && (
          <Card className="border-border bg-card p-12">
            <div className="text-center">
              <Star className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium text-foreground">No reviews found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </Card>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Review</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this review. This will be shared with the user.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea 
                placeholder="Enter rejection reason..." 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedReview && handleReject(selectedReview.id)}
              >
                Reject Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ReviewModerationPage;
