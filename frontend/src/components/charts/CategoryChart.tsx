import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/lib/chart-theme';
import { CategoryData, PeriodFilter, GraphType } from '@/services/financialService';
import { PieChart, ChevronDown, ChevronUp, Filter as FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraphDateFilter } from '@/components/GraphDateFilter';

interface CategoryChartProps {
  categoryData: CategoryData[];
  currentFilter?: PeriodFilter;
  globalFilter?: PeriodFilter;
  onFilterChange: (graphType: GraphType, filter: PeriodFilter | undefined) => void;
  onResetFilter: (graphType: GraphType) => void;
}

/**
 * CategoryChart Component
 * 
 * LOTE 5: Gráfico de Categorias com filtro individual
 * - Mostra distribuição por categoria
 * - Permite filtro customizado independente do global
 * - Indicador visual quando filtro customizado está ativo
 */
export const CategoryChart = ({
  categoryData,
  currentFilter,
  globalFilter,
  onFilterChange,
  onResetFilter,
}: CategoryChartProps) => {
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
    onResetFilter(GraphType.CATEGORY);
    setIsFilterExpanded(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            <CardTitle>Distribuição por Categoria</CardTitle>
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
              onPeriodChange={(filter) => onFilterChange(GraphType.CATEGORY, filter)}
              onApply={() => setIsFilterExpanded(false)}
            />
          </div>
        </div>
      )}

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid {...GRID_STYLE} vertical={false} />
            <XAxis
              dataKey="category"
              tick={AXIS_STYLE.tick}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              tick={AXIS_STYLE.tick}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar
              dataKey="total"
              fill={CHART_COLORS[2]}
              name="Total"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
