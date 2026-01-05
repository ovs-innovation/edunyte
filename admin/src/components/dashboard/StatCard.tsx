import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-glow',
        className
      )}
    >
      <div className="absolute inset-0 gradient-card opacity-50" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {change && (
              <p
                className={cn(
                  'mt-1 text-sm font-medium',
                  changeType === 'positive' && 'text-success',
                  changeType === 'negative' && 'text-destructive',
                  changeType === 'neutral' && 'text-muted-foreground'
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
