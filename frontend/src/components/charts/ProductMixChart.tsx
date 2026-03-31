import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/chart-theme';
import { Coffee } from 'lucide-react';
import { ProductMixPerformance } from '@/services/vendingMachineService';

interface ProductMixChartProps {
  productMixData: ProductMixPerformance[];
}

/**
 * ProductMixChart - Chart Component
 * 
 * Displays product mix performance (coffee blends: qCafe1, qCafe2, qCafe3).
 * Shows sales distribution by product type.
 */
export const ProductMixChart = ({ productMixData }: ProductMixChartProps) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Mix de Produtos
        </CardTitle>
        <Coffee className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Performance de vendas por tipo de café
          </p>
        </div>

        {productMixData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productMixData}
                  dataKey="salesCount"
                  nameKey="product"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                  label={({ product, percentage }) => `${product}: ${formatPercentage(percentage)}`}
                >
                  {productMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: any, name: string, props: any) => {
                    const entry = props.payload;
                    return [
                      `${value} vendas (${formatCurrency(entry.totalRevenue)})`,
                      entry.product,
                    ];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Detailed breakdown */}
            <div className="mt-6 space-y-2">
              {productMixData.map((product, index) => (
                <div key={product.product} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{product.product}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(product.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.salesCount} vendas ({formatPercentage(product.percentage)})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
