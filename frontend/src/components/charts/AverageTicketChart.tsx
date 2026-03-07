import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SEMANTIC_COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/lib/chart-theme';
import { DollarSign } from 'lucide-react';
import { AverageTicketTrend } from '@/services/vendingMachineService';

interface AverageTicketChartProps {
  ticketData: AverageTicketTrend[];
}

/**
 * AverageTicketChart - Chart Component
 * 
 * Displays average ticket value trend over time.
 * Shows how the average transaction value changes day by day.
 */
export const AverageTicketChart = ({ ticketData }: AverageTicketChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Calculate average for the period
  const overallAverage = ticketData.length > 0
    ? ticketData.reduce((sum, d) => sum + d.averageTicket, 0) / ticketData.length
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Ticket Médio
        </CardTitle>
        <DollarSign className="h-5 w-5 text-success" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Valor médio por transação ao longo do tempo
          </p>
          {ticketData.length > 0 && (
            <p className="text-xl font-bold text-success mt-2">
              {formatCurrency(overallAverage)}
              <span className="text-sm font-normal text-muted-foreground ml-2">media do periodo</span>
            </p>
          )}
        </div>

        {ticketData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ticketData}>
              <CartesianGrid {...GRID_STYLE} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={AXIS_STYLE.tick}
              />
              <YAxis
                tickFormatter={(value) => `R$ ${value}`}
                tick={AXIS_STYLE.tick}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Ticket Médio']}
                labelFormatter={(label) => `Data: ${formatDate(label)}`}
              />
              <Line
                type="monotone"
                dataKey="averageTicket"
                stroke={SEMANTIC_COLORS.revenue}
                strokeWidth={2}
                strokeLinecap="round"
                dot={{ fill: SEMANTIC_COLORS.revenue, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 Acompanhe variações no valor médio das vendas</p>
        </div>
      </CardContent>
    </Card>
  );
};
