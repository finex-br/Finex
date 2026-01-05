import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendData, PeriodFilter, GraphType } from '@/services/financialService';
import { TrendingUp, ChevronDown, ChevronUp, Filter as FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraphDateFilter } from '@/components/GraphDateFilter';

interface TrendChartProps {
  trendData: TrendData[];
  currentFilter?: PeriodFilter;
  globalFilter?: PeriodFilter;
  onFilterChange: (graphType: GraphType, filter: PeriodFilter | undefined) => void;
  onResetFilter: (graphType: GraphType) => void;
  companyId?: string;
}

/**
 * TrendChart Component
 * 
 * LOTE 5: Gráfico de Tendência com filtro individual
 * - Mostra evolução financeira ao longo do tempo
 * - Permite filtro customizado independente do global
 * - Indicador visual quando filtro customizado está ativo
 */
export const TrendChart = ({
  trendData,
  currentFilter,
  globalFilter,
  onFilterChange,
  onResetFilter,
}: TrendChartProps) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const hasCustomFilter = currentFilter !== undefined && currentFilter !== globalFilter;

  // Formatar valores para exibição
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleResetFilter = () => {
    onResetFilter(GraphType.TREND);
    setIsFilterExpanded(false);
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <CardTitle>Evolução Financeira</CardTitle>
            {hasCustomFilter && (
              <Badge variant="secondary" className="text-xs">
                <FilterIcon className="w-3 h-3 mr-1" />
                Filtro Customizado
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="text-muted-foreground"
          >
            {isFilterExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Ocultar Filtro
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Filtro Personalizado
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {/* Área de Filtro Customizado (Colapsável) */}
      {isFilterExpanded && (
        <div className="px-6 pb-4 border-b">
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Configure um período diferente apenas para este gráfico
              </p>
              {hasCustomFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilter}
                  className="text-xs"
                >
                  Voltar ao Filtro Global
                </Button>
              )}
            </div>
            
            <GraphDateFilter
              periodFilter={currentFilter}
              onPeriodChange={(filter) => onFilterChange(GraphType.TREND, filter)}
              onApply={() => setIsFilterExpanded(false)}
            />
          </div>
        </div>
      )}

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: 'black' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              name="Receitas"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              name="Despesas"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Lucro"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
