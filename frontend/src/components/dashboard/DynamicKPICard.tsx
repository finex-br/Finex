import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DynamicKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  neutral: {
    icon: Minus,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
} as const;

export function DynamicKPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  className,
}: DynamicKPICardProps): React.ReactElement {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString('pt-BR') : value;

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
            <span className="text-3xl font-bold text-foreground">
              {formattedValue}
            </span>
            {subtitle && (
              <span className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </span>
            )}
          </div>

          {trend && (
            <div className="flex flex-col items-end gap-1">
              {(() => {
                const config = trendConfig[trend];
                const Icon = config.icon;
                return (
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                      config.bg,
                      config.color,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {trendValue && <span>{trendValue}</span>}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
