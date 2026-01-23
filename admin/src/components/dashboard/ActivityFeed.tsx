import { mockActivity } from '@/lib/mockData';
import { Activity } from 'lucide-react';

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {mockActivity.map((item, index) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/30"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {item.user.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.user}</span>{' '}
                <span className="text-muted-foreground">{item.action}</span>{' '}
                <span className="font-medium">{item.target}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
