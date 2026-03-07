import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DynamicChart } from '../charts/DynamicChart';
import { SafeHtmlRenderer } from './SafeHtmlRenderer';

interface ChartPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ChartConfig {
  id: string;
  name: string;
  chartType: string;
  dataSource: any;
  visualConfig: any;
  position: ChartPosition;
  displayOrder: number;
}

interface ChartData {
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

interface DashboardChart {
  config: ChartConfig;
  data: ChartData;
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  embedHtml?: string;
  charts: DashboardChart[];
}

interface DynamicDashboardRendererProps {
  dashboard: Dashboard;
  onRefresh?: () => void;
  isLoading?: boolean;
}

function SkeletonCard(): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
}

export function DynamicDashboardRenderer({
  dashboard,
  onRefresh,
  isLoading = false,
}: DynamicDashboardRendererProps): React.ReactElement {
  const sortedCharts = [...dashboard.charts].sort(
    (a, b) => a.config.displayOrder - b.config.displayOrder,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {dashboard.name}
          </h2>
          {dashboard.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {dashboard.description}
            </p>
          )}
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')}
            />
            Atualizar
          </Button>
        )}
      </div>

      {/* Embed HTML */}
      {dashboard.embedHtml && (
        <Card>
          <CardContent className="pt-6">
            <SafeHtmlRenderer
              html={dashboard.embedHtml}
              className="w-full [&_iframe]:w-full [&_iframe]:min-h-[400px] [&_iframe]:rounded-md"
            />
          </CardContent>
        </Card>
      )}

      {/* Charts grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : sortedCharts.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-sm text-muted-foreground">
            Nenhum grafico configurado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCharts.map((chart) => {
            const colSpan = getColSpan(chart.config.position.width);

            return (
              <div
                key={chart.config.id}
                className={cn(
                  colSpan === 3 && 'md:col-span-2 lg:col-span-3',
                  colSpan === 2 && 'md:col-span-2 lg:col-span-2',
                )}
              >
                <DynamicChart
                  chartType={chart.config.chartType as any}
                  data={chart.data}
                  visualConfig={{
                    ...chart.config.visualConfig,
                    title:
                      chart.config.visualConfig?.title ?? chart.config.name,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Maps a grid width value (out of 12 columns) to a responsive col-span value.
 *  - width <= 4  => 1 column
 *  - width <= 8  => 2 columns
 *  - width >  8  => 3 columns (full width)
 */
function getColSpan(width: number): number {
  if (width <= 4) return 1;
  if (width <= 8) return 2;
  return 3;
}
