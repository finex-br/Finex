import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEMANTIC_COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/lib/chart-theme';
import { MonthlyData, PeriodFilter, GraphType } from '@/services/financialService';
import { BarChart3, ChevronDown, ChevronUp, Filter as FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraphDateFilter } from '@/components/GraphDateFilter';

interface MonthlyChartProps {
  monthlyData: MonthlyData[];
  currentFilter?: PeriodFilter;
  globalFilter?: PeriodFilter;
  onFilterChange: (graphType: GraphType, filter: PeriodFilter | undefined) => void;
  onResetFilter: (graphType: GraphType) => void;
}

/**
 * MonthlyChart Component
 * 
 * LOTE 5: Gráfico Mensal com filtro individual
 * - Mostra comparativo receitas vs despesas
 * - Permite filtro customizado independente do global
 * - Indicador visual quando filtro customizado está ativo
 */
export const MonthlyChart = ({
  monthlyData,
  currentFilter,
  globalFilter,
  onFilterChange,
  onResetFilter,
}: MonthlyChartProps) => {
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
    onResetFilter(GraphType.MONTHLY);
    setIsFilterExpanded(false);
  };

  // Formatar label do eixo X baseado no formato da data
  const formatDateLabel = (dateStr: string) => {
    // YYYY-MM-DD (dia) -> "01 Jan"
    if (dateStr.length === 10) {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
    // YYYY-MM (mês) -> "Jan 2025"
    if (dateStr.length === 7) {
      const [year, month] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    }
    return dateStr;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <CardTitle>Receitas vs Despesas</CardTitle>
            {hasCustomFilter && (
              <Badge variant="secondary" className="text-xs">
                <FilterIcon className="w-3 h-3 mr-1" />
                Customizado
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
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Área de Filtro Customizado (Colapsável) */}
      {isFilterExpanded && (
        <div className="px-6 pb-4 border-b">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Filtro personalizado
              </p>
              {hasCustomFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilter}
                  className="text-xs"
                >
                  Resetar
                </Button>
              )}
            </div>

            <GraphDateFilter
              periodFilter={currentFilter}
              onPeriodChange={(filter) => onFilterChange(GraphType.MONTHLY, filter)}
              onApply={() => setIsFilterExpanded(false)}
            />
          </div>
        </div>
      )}

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid {...GRID_STYLE} vertical={false} />
            <XAxis
              dataKey="month"
              tick={AXIS_STYLE.tick}
              tickFormatter={formatDateLabel}
              angle={monthlyData.length > 10 ? -45 : 0}
              textAnchor={monthlyData.length > 10 ? "end" : "middle"}
              height={monthlyData.length > 10 ? 80 : 30}
            />
            <YAxis
              tick={AXIS_STYLE.tick}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              fill={SEMANTIC_COLORS.revenue}
              name="Receitas"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="expense"
              fill={SEMANTIC_COLORS.expense}
              name="Despesas"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
