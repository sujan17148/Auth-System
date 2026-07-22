import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TrendProps {
  value: number;
  isPositive: boolean;
}
export interface MetricsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass?: string;
  trend?: TrendProps;
  className?: string;
}

export default function MetricsCard({
  title,
  value,
  description,
  icon: IconComponent,
  iconClass = 'bg-primary/25',
  trend,
  className = '',
}: MetricsCardProps) {
  return (
    <Card className={cn('metric-card w-full', className)}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-emerald-600' : 'text-rose-600',
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
          </div>
          {IconComponent && (
            <div
              className={cn(
                `metric-card-icon p-2 rounded-full flex items-center justify-center shrink-0`,
                iconClass,
              )}
            >
              <IconComponent className="size-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricsCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={`metric-card w-full animate-pulse ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3 w-full">
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
          <div className="p-2 rounded-full bg-slate-200 h-12 w-12 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
