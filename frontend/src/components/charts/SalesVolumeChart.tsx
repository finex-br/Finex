import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, SEMANTIC_COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/lib/chart-theme';
import { TrendingUp } from 'lucide-react';
import { SalesVolumeByMachine } from '@/services/vendingMachineService';

interface SalesVolumeChartProps {
  salesData: SalesVolumeByMachine[];
}

/**
 * SalesVolumeChart - Chart Component
 * 
 * Displays sales volume by vending machine (device).
 * Shows total sales count and revenue per machine.
 */
export const SalesVolumeChart = ({ salesData }: SalesVolumeChartProps) => {
  // Sort by total revenue (descending)
  const sortedData = [...salesData].sort((a, b) => b.totalRevenue - a.totalRevenue);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDeviceId = (deviceId: string) => {
    // Shorten long device names for better display
    return deviceId.length > 15 ? `${deviceId.substring(0, 15)}...` : deviceId;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Vendas por Máquina
        </CardTitle>
        <TrendingUp className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Volume de vendas e receita por dispositivo
          </p>
        </div>

        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData}>
              <CartesianGrid {...GRID_STYLE} vertical={false} />
              <XAxis
                dataKey="deviceId"
                angle={-45}
                textAnchor="end"
                height={100}
                tickFormatter={formatDeviceId}
                tick={AXIS_STYLE.tick}
              />
              <YAxis
                yAxisId="left"
                label={{ value: 'Vendas', angle: -90, position: 'insideLeft' }}
                tick={AXIS_STYLE.tick}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Receita (R$)', angle: 90, position: 'insideRight' }}
                tick={AXIS_STYLE.tick}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: any, name: string) => {
                  if (name === 'totalRevenue') {
                    return [formatCurrency(Number(value)), 'Receita'];
                  }
                  return [value, 'Vendas'];
                }}
                labelFormatter={(label) => `Máquina: ${label}`}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="totalSales"
                fill={CHART_COLORS[2]}
                name="Vendas"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="totalRevenue"
                fill={SEMANTIC_COLORS.revenue}
                name="Receita"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 Máquinas ordenadas por receita total (maior para menor)</p>
        </div>
      </CardContent>
    </Card>
  );
};
