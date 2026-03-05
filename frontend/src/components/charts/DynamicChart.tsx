import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DynamicChartProps {
  chartType:
    | 'BAR'
    | 'LINE'
    | 'PIE'
    | 'AREA'
    | 'KPI'
    | 'TABLE'
    | 'STATUS'
    | 'SCATTER'
    | 'HEATMAP'
    | 'GAUGE';
  data: {
    columns: string[];
    rows: Record<string, any>[];
    totalRows: number;
  };
  visualConfig: {
    xAxis?: string;
    yAxis?: string[];
    colorBy?: string;
    title?: string;
    subtitle?: string;
    colors?: string[];
    legend?: boolean;
  };
  className?: string;
}

const DEFAULT_COLORS = [
  '#f97316',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#f59e0b',
  '#ec4899',
];

function renderBarChart(
  data: DynamicChartProps['data'],
  visualConfig: DynamicChartProps['visualConfig'],
  colors: string[],
): React.ReactElement {
  const { xAxis, yAxis, legend: showLegend } = visualConfig;
  const xKey = xAxis ?? data.columns[0];
  const yKeys = yAxis ?? data.columns.slice(1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.rows}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        {showLegend !== false && <Legend />}
        {yKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderLineChart(
  data: DynamicChartProps['data'],
  visualConfig: DynamicChartProps['visualConfig'],
  colors: string[],
): React.ReactElement {
  const { xAxis, yAxis, legend: showLegend } = visualConfig;
  const xKey = xAxis ?? data.columns[0];
  const yKeys = yAxis ?? data.columns.slice(1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.rows}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        {showLegend !== false && <Legend />}
        {yKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function renderAreaChart(
  data: DynamicChartProps['data'],
  visualConfig: DynamicChartProps['visualConfig'],
  colors: string[],
): React.ReactElement {
  const { xAxis, yAxis, legend: showLegend } = visualConfig;
  const xKey = xAxis ?? data.columns[0];
  const yKeys = yAxis ?? data.columns.slice(1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data.rows}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        {showLegend !== false && <Legend />}
        {yKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function renderPieChart(
  data: DynamicChartProps['data'],
  visualConfig: DynamicChartProps['visualConfig'],
  colors: string[],
): React.ReactElement {
  const { xAxis, yAxis, legend: showLegend } = visualConfig;
  const nameKey = xAxis ?? data.columns[0];
  const valueKey = yAxis?.[0] ?? data.columns[1];

  const pieData = data.rows.map((row) => ({
    name: row[nameKey],
    value: Number(row[valueKey]) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {pieData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        {showLegend !== false && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

function renderScatterChart(
  data: DynamicChartProps['data'],
  visualConfig: DynamicChartProps['visualConfig'],
  colors: string[],
): React.ReactElement {
  const { legend: showLegend } = visualConfig;
  const xKey = data.columns[0];
  const yKey = data.columns[1] ?? data.columns[0];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} name={xKey} />
        <YAxis dataKey={yKey} name={yKey} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        {showLegend !== false && <Legend />}
        <Scatter
          name={`${xKey} vs ${yKey}`}
          data={data.rows}
          fill={colors[0]}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function renderKPI(
  data: DynamicChartProps['data'],
  visualConfig: DynamicChartProps['visualConfig'],
): React.ReactElement {
  const { yAxis, subtitle } = visualConfig;
  const valueKey = yAxis?.[0] ?? data.columns[0];
  const value = data.rows.length > 0 ? data.rows[0][valueKey] : '---';

  const formattedValue =
    typeof value === 'number'
      ? value.toLocaleString('pt-BR')
      : String(value ?? '---');

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <TrendingUp className="h-5 w-5" />
      </div>
      <span className="text-4xl font-bold text-foreground">
        {formattedValue}
      </span>
      {subtitle && (
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      )}
    </div>
  );
}

function renderTable(data: DynamicChartProps['data']): React.ReactElement {
  return (
    <div className="max-h-[400px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {data.columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {data.columns.map((col) => (
                <TableCell key={col}>{String(row[col] ?? '')}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function renderPlaceholder(chartType: string): React.ReactElement {
  return (
    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
      <span className="text-sm">
        {chartType} &mdash; Em breve
      </span>
    </div>
  );
}

export function DynamicChart({
  chartType,
  data,
  visualConfig,
  className,
}: DynamicChartProps): React.ReactElement {
  const colors = visualConfig.colors ?? DEFAULT_COLORS;
  const hasData = data && data.rows && data.rows.length > 0;

  const renderContent = (): React.ReactElement => {
    if (!hasData) {
      return (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <span className="text-sm">Nenhum dado disponivel</span>
        </div>
      );
    }

    switch (chartType) {
      case 'BAR':
        return renderBarChart(data, visualConfig, colors);
      case 'LINE':
        return renderLineChart(data, visualConfig, colors);
      case 'AREA':
        return renderAreaChart(data, visualConfig, colors);
      case 'PIE':
        return renderPieChart(data, visualConfig, colors);
      case 'KPI':
        return renderKPI(data, visualConfig);
      case 'TABLE':
        return renderTable(data);
      case 'SCATTER':
        return renderScatterChart(data, visualConfig, colors);
      case 'STATUS':
      case 'HEATMAP':
      case 'GAUGE':
        return renderPlaceholder(chartType);
      default:
        return renderPlaceholder(chartType);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      {visualConfig.title && (
        <CardHeader>
          <CardTitle className="text-base">{visualConfig.title}</CardTitle>
          {visualConfig.subtitle && chartType !== 'KPI' && (
            <CardDescription>{visualConfig.subtitle}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
