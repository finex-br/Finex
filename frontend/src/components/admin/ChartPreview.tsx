import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Loader2, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface VisualConfig {
  xAxis?: string;
  yAxis?: string[];
  title?: string;
  colors?: string[];
  legend?: boolean;
}

interface ChartData {
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

interface ChartPreviewProps {
  chartType: string;
  data: ChartData | null;
  visualConfig: VisualConfig;
  isLoading?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

export function ChartPreview({
  chartType,
  data,
  visualConfig,
  isLoading = false,
}: ChartPreviewProps) {
  const colors = visualConfig.colors ?? DEFAULT_COLORS;
  const showLegend = visualConfig.legend ?? true;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Carregando visualizacao...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !visualConfig.xAxis && !visualConfig.yAxis?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12" />
            <p className="text-sm">
              Configure as colunas para ver a visualizacao
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { rows } = data;
  const yAxisCols = visualConfig.yAxis ?? [];

  // KPI type
  if (chartType === 'KPI') {
    const valueCol = yAxisCols[0];
    if (!valueCol || rows.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Selecione uma coluna de valor para o KPI
          </CardContent>
        </Card>
      );
    }

    const total = rows.reduce((sum, row) => {
      const val = Number(row[valueCol]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return (
      <Card>
        <CardContent className="p-6">
          {visualConfig.title && (
            <p className="text-sm text-muted-foreground mb-2">
              {visualConfig.title}
            </p>
          )}
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-5xl font-bold text-foreground">
              {total.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              {valueCol}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // TABLE type
  if (chartType === 'TABLE') {
    const displayCols = visualConfig.xAxis
      ? [visualConfig.xAxis, ...yAxisCols]
      : yAxisCols;

    return (
      <Card>
        <CardContent className="p-6">
          {visualConfig.title && (
            <p className="text-sm font-medium mb-3">{visualConfig.title}</p>
          )}
          <div className="rounded-md border max-h-[350px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {displayCols.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 50).map((row, idx) => (
                  <TableRow key={idx}>
                    {displayCols.map((col) => (
                      <TableCell key={col}>
                        {row[col] != null ? String(row[col]) : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {rows.length > 50 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Exibindo 50 de {rows.length} linhas
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Recharts-based charts
  const xAxisKey = visualConfig.xAxis;

  return (
    <Card>
      <CardContent className="p-6">
        {visualConfig.title && (
          <p className="text-sm font-medium mb-3">{visualConfig.title}</p>
        )}
        <ResponsiveContainer width="100%" height={350}>
          {chartType === 'BAR' ? (
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              {xAxisKey && (
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
              )}
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {showLegend && <Legend />}
              {yAxisCols.map((col, i) => (
                <Bar
                  key={col}
                  dataKey={col}
                  fill={colors[i % colors.length]}
                  name={col}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : chartType === 'LINE' ? (
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              {xAxisKey && (
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
              )}
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {showLegend && <Legend />}
              {yAxisCols.map((col, i) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  name={col}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          ) : chartType === 'AREA' ? (
            <AreaChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              {xAxisKey && (
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
              )}
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {showLegend && <Legend />}
              {yAxisCols.map((col, i) => (
                <Area
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name={col}
                />
              ))}
            </AreaChart>
          ) : chartType === 'PIE' ? (
            <PieChart>
              <Tooltip />
              {showLegend && <Legend />}
              <Pie
                data={rows.map((row) => ({
                  name: xAxisKey ? String(row[xAxisKey]) : '',
                  value: Number(row[yAxisCols[0]] ?? 0),
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {rows.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={colors[i % colors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              {xAxisKey && (
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
              )}
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {showLegend && <Legend />}
              {yAxisCols.map((col, i) => (
                <Bar
                  key={col}
                  dataKey={col}
                  fill={colors[i % colors.length]}
                  name={col}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
