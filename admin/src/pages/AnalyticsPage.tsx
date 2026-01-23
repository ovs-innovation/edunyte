import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track platform performance and user engagement.
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Page Views', value: '24.5K', change: '+15%', icon: BarChart3 },
            { label: 'Unique Visitors', value: '8,234', change: '+8%', icon: Users },
            { label: 'Avg. Session', value: '4m 32s', change: '+2%', icon: Clock },
            { label: 'Bounce Rate', value: '32%', change: '-5%', icon: TrendingUp },
          ].map((stat, index) => (
            <Card
              key={stat.label}
              className="border-border bg-card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-success">{stat.change}</span>
              </div>
              <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Chart Placeholder */}
        <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="mb-4 font-semibold text-foreground">User Activity Over Time</h3>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Chart visualization would go here
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
