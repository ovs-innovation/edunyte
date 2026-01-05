import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Activity,
  Eye,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const enrollmentData = [
  { month: 'Jan', enrollments: 120, revenue: 4500 },
  { month: 'Feb', enrollments: 180, revenue: 6800 },
  { month: 'Mar', enrollments: 250, revenue: 9200 },
  { month: 'Apr', enrollments: 220, revenue: 8100 },
  { month: 'May', enrollments: 310, revenue: 11500 },
  { month: 'Jun', enrollments: 280, revenue: 10200 },
  { month: 'Jul', enrollments: 350, revenue: 13000 },
];

const trafficData = [
  { day: 'Mon', visitors: 2400, pageViews: 4800 },
  { day: 'Tue', visitors: 1398, pageViews: 3200 },
  { day: 'Wed', visitors: 3800, pageViews: 7600 },
  { day: 'Thu', visitors: 3908, pageViews: 7800 },
  { day: 'Fri', visitors: 4800, pageViews: 9600 },
  { day: 'Sat', visitors: 3800, pageViews: 7200 },
  { day: 'Sun', visitors: 4300, pageViews: 8600 },
];

const coursePerformanceData = [
  { name: 'Web Development', students: 450, completion: 78, rating: 4.8 },
  { name: 'Data Science', students: 380, completion: 65, rating: 4.6 },
  { name: 'UI/UX Design', students: 290, completion: 82, rating: 4.9 },
  { name: 'Mobile Dev', students: 210, completion: 71, rating: 4.5 },
  { name: 'Cloud Computing', students: 180, completion: 68, rating: 4.7 },
];

const userDistribution = [
  { name: 'Students', value: 4500, color: 'hsl(var(--primary))' },
  { name: 'Teachers', value: 280, color: 'hsl(var(--chart-2))' },
  { name: 'Admins', value: 25, color: 'hsl(var(--chart-3))' },
  { name: 'Moderators', value: 45, color: 'hsl(var(--chart-4))' },
];

const recentActivity = [
  { id: 1, user: 'John Doe', action: 'Enrolled in Web Development', time: '2 min ago', type: 'enrollment' },
  { id: 2, user: 'Sarah Smith', action: 'Completed Data Science Course', time: '5 min ago', type: 'completion' },
  { id: 3, user: 'Mike Johnson', action: 'Purchased Premium Plan', time: '12 min ago', type: 'purchase' },
  { id: 4, user: 'Emily Brown', action: 'Submitted assignment', time: '18 min ago', type: 'submission' },
  { id: 5, user: 'David Wilson', action: 'Started new course', time: '25 min ago', type: 'enrollment' },
];

const chartConfig = {
  enrollments: { label: 'Enrollments', color: 'hsl(var(--primary))' },
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-2))' },
  visitors: { label: 'Visitors', color: 'hsl(var(--primary))' },
  pageViews: { label: 'Page Views', color: 'hsl(var(--chart-2))' },
  students: { label: 'Students', color: 'hsl(var(--primary))' },
};

const ControlDashboardPage = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState('all');

  const stats = [
    { 
      label: 'Active Users', 
      value: '4,850', 
      change: '+12.5%', 
      trend: 'up',
      icon: Users,
      description: 'Currently online'
    },
    { 
      label: 'Total Revenue', 
      value: '₹ 128,450', 
      change: '+8.2%', 
      trend: 'up',
      icon: DollarSign,
      description: 'This month'
    },
    { 
      label: 'Total Courses', 
      value: '156', 
      change: '+5', 
      trend: 'up',
      icon: BookOpen,
      description: 'Published courses'
    },
    { 
      label: 'Total Enrollments', 
      value: '12,840', 
      change: '+18.3%', 
      trend: 'up',
      icon: GraduationCap,
      description: 'All time'
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Control Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Real-time analytics and platform insights
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px] bg-card border-border">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[160px] bg-card border-border">
                <BookOpen className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="web">Web Development</SelectItem>
                <SelectItem value="data">Data Science</SelectItem>
                <SelectItem value="design">UI/UX Design</SelectItem>
                <SelectItem value="mobile">Mobile Dev</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
              <SelectTrigger className="w-[160px] bg-card border-border">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                <SelectItem value="john">John Smith</SelectItem>
                <SelectItem value="sarah">Sarah Johnson</SelectItem>
                <SelectItem value="mike">Mike Wilson</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm" className="border-border">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="border-border bg-card p-6 animate-slide-up hover:shadow-lg transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge 
                  variant="outline" 
                  className={stat.trend === 'up' 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' 
                    : 'border-red-500/30 bg-red-500/10 text-red-500'
                  }
                >
                  {stat.trend === 'up' ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                  {stat.change}
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-xs text-muted-foreground/70">{stat.description}</p>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enrollment Trends */}
          <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Enrollment Trends</h3>
                <p className="text-sm text-muted-foreground">Monthly enrollment & revenue</p>
              </div>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                <TrendingUp className="mr-1 h-3 w-3" /> +18.3%
              </Badge>
            </div>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={enrollmentData}>
                <defs>
                  <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#enrollmentGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </Card>

          {/* Website Traffic */}
          <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Website Traffic</h3>
                <p className="text-sm text-muted-foreground">Daily visitors & page views</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Visitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-2" />
                  <span className="text-muted-foreground">Page Views</span>
                </div>
              </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pageViews" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                />
              </LineChart>
            </ChartContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Course Performance */}
          <Card className="border-border bg-card p-6 lg:col-span-2 animate-slide-up" style={{ animationDelay: '600ms' }}>
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">Course Performance</h3>
              <p className="text-sm text-muted-foreground">Top performing courses by enrollment</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={coursePerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-muted-foreground" />
                <YAxis dataKey="name" type="category" width={100} className="text-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="students" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </Card>

          {/* User Distribution */}
          <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">User Distribution</h3>
              <p className="text-sm text-muted-foreground">By role type</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {userDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-medium text-foreground">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '800ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Real-time Activity</h3>
              <p className="text-sm text-muted-foreground">Latest platform activities</p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-500">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ControlDashboardPage;
