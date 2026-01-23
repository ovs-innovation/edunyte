import { AdminLayout } from '@/components/layout/AdminLayout';
import { PermissionGate } from '@/components/PermissionGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Clock } from 'lucide-react';

const reports = [
  { id: 1, name: 'Monthly User Report', type: 'Users', date: '2024-01-15', status: 'Ready' },
  { id: 2, name: 'Q4 Analytics Summary', type: 'Analytics', date: '2024-01-10', status: 'Ready' },
  { id: 3, name: 'Security Audit Log', type: 'Security', date: '2024-01-08', status: 'Ready' },
  { id: 4, name: 'Revenue Dashboard', type: 'Finance', date: '2024-01-05', status: 'Processing' },
  { id: 5, name: 'User Engagement Metrics', type: 'Analytics', date: '2024-01-01', status: 'Ready' },
];

const ReportsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
            <p className="mt-1 text-muted-foreground">
              View and export generated reports.
            </p>
          </div>
          <PermissionGate permission="reports.export">
            <Button size="sm" className="gap-2 gradient-primary text-primary-foreground hover:opacity-90">
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
          </PermissionGate>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {reports.map((report, index) => (
            <Card
              key={report.id}
              className="flex items-center justify-between border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-glow animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{report.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.date).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {report.type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={
                    report.status === 'Ready'
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-warning/30 bg-warning/10 text-warning'
                  }
                >
                  {report.status === 'Processing' && <Clock className="mr-1 h-3 w-3 animate-spin" />}
                  {report.status}
                </Badge>
                <PermissionGate permission="reports.export">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={report.status !== 'Ready'}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </PermissionGate>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
