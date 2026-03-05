import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Ticket Médio
        </CardTitle>
        <DollarSign className="h-5 w-5 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Valor médio por transação ao longo do tempo
          </p>
          {ticketData.length > 0 && (
            <p className="text-xl font-bold text-green-600 mt-2">
              {formatCurrency(overallAverage)}
              <span className="text-sm font-normal text-slate-500 ml-2">média do período</span>
            </p>
          )}
        </div>

        {ticketData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            Nenhum dado disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ticketData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), 'Ticket Médio']}
                labelFormatter={(label) => `Data: ${formatDate(label)}`}
              />
              <Line 
                type="monotone" 
                dataKey="averageTicket" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          <p>💡 Acompanhe variações no valor médio das vendas</p>
        </div>
      </CardContent>
    </Card>
  );
};
