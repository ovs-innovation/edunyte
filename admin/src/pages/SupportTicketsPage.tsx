import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  user: {
    name: string;
    email: string;
    role: 'student' | 'teacher';
    avatar?: string;
  };
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: number;
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Cannot access course materials',
    description: 'I enrolled in the Web Development course but cannot view the video lectures.',
    user: { name: 'John Doe', email: 'john@example.com', role: 'student' },
    status: 'open',
    priority: 'high',
    category: 'Technical Issue',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    messages: 3,
  },
  {
    id: 'TKT-002',
    subject: 'Payment not reflected',
    description: 'I made a payment for the premium plan but it is not showing in my account.',
    user: { name: 'Sarah Smith', email: 'sarah@example.com', role: 'student' },
    status: 'in_progress',
    priority: 'urgent',
    category: 'Billing',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    assignedTo: 'Mike Wilson',
    messages: 5,
  },
  {
    id: 'TKT-003',
    subject: 'Course upload issue',
    description: 'Unable to upload video content for my new course. Getting timeout errors.',
    user: { name: 'Dr. Emily Brown', email: 'emily@example.com', role: 'teacher' },
    status: 'resolved',
    priority: 'medium',
    category: 'Technical Issue',
    createdAt: '2024-01-13T08:45:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    assignedTo: 'Tech Support',
    messages: 8,
  },
  {
    id: 'TKT-004',
    subject: 'Certificate not generated',
    description: 'I completed the Data Science course but did not receive my certificate.',
    user: { name: 'David Lee', email: 'david@example.com', role: 'student' },
    status: 'closed',
    priority: 'low',
    category: 'Certificate',
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
    assignedTo: 'Admin',
    messages: 4,
  },
  {
    id: 'TKT-005',
    subject: 'Student harassment complaint',
    description: 'A student is leaving inappropriate comments on my course discussions.',
    user: { name: 'Prof. James Wilson', email: 'james@example.com', role: 'teacher' },
    status: 'in_progress',
    priority: 'urgent',
    category: 'Complaint',
    createdAt: '2024-01-15T07:15:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
    assignedTo: 'Moderator Team',
    messages: 6,
  },
];

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  open: { label: 'Open', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground border-border', icon: XCircle },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-500/10 text-slate-500 border-slate-500/30' },
  medium: { label: 'Medium', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  high: { label: 'High', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-500 border-red-500/30' },
};

const SupportTicketsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const ticketCounts = {
    all: mockTickets.length,
    open: mockTickets.filter(t => t.status === 'open').length,
    in_progress: mockTickets.filter(t => t.status === 'in_progress').length,
    resolved: mockTickets.filter(t => t.status === 'resolved').length,
    closed: mockTickets.filter(t => t.status === 'closed').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Support Tickets</h1>
            <p className="mt-1 text-muted-foreground">
              Manage student and teacher support requests
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
                <DialogDescription>
                  Create a new support ticket on behalf of a user.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="user">User Email</Label>
                  <Input id="user" placeholder="user@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief description of the issue" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Detailed description of the issue..." rows={4} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Ticket</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Open', count: ticketCounts.open, icon: AlertCircle, color: 'text-blue-500' },
            { label: 'In Progress', count: ticketCounts.in_progress, icon: Clock, color: 'text-amber-500' },
            { label: 'Resolved', count: ticketCounts.resolved, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Closed', count: ticketCounts.closed, icon: XCircle, color: 'text-muted-foreground' },
          ].map((stat, index) => (
            <Card
              key={stat.label}
              className="border-border bg-card p-4 animate-slide-up cursor-pointer hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setStatusFilter(stat.label.toLowerCase().replace(' ', '_'))}
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-2xl font-bold text-foreground">{stat.count}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label} Tickets</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-border bg-card p-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search tickets by ID, subject, or user..." 
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tickets List */}
        <div className="space-y-3">
          {filteredTickets.map((ticket, index) => {
            const StatusIcon = statusConfig[ticket.status].icon;
            return (
              <Card
                key={ticket.id}
                className="border-border bg-card p-4 animate-slide-up hover:shadow-md transition-all cursor-pointer"
                style={{ animationDelay: `${(index + 5) * 50}ms` }}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                        <Badge variant="outline" className={priorityConfig[ticket.priority].color}>
                          {priorityConfig[ticket.priority].label}
                        </Badge>
                        <Badge variant="outline" className={statusConfig[ticket.status].color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[ticket.status].label}
                        </Badge>
                      </div>
                      <h3 className="mt-1 font-medium text-foreground truncate">{ticket.subject}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{ticket.user.name}</span>
                        <span>•</span>
                        <span className="capitalize">{ticket.user.role}</span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>{ticket.messages}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(ticket.updatedAt)}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Assign To</DropdownMenuItem>
                        <DropdownMenuItem>Change Status</DropdownMenuItem>
                        <DropdownMenuItem>Change Priority</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Close Ticket</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTickets.length === 0 && (
          <Card className="border-border bg-card p-12">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium text-foreground">No tickets found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default SupportTicketsPage;
