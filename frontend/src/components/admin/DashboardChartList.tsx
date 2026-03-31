import { Edit, Trash2, Plus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ChartItem {
  id: string;
  name: string;
  chartType: string;
  displayOrder: number;
}

interface DashboardChartListProps {
  charts: ChartItem[];
  onEdit: (chartId: string) => void;
  onDelete: (chartId: string) => void;
  onAddChart: () => void;
}

const chartTypeLabels: Record<string, string> = {
  BAR: 'Barras',
  LINE: 'Linha',
  PIE: 'Pizza',
  AREA: 'Area',
  KPI: 'KPI',
  TABLE: 'Tabela',
};

export function DashboardChartList({
  charts,
  onEdit,
  onDelete,
  onAddChart,
}: DashboardChartListProps) {
  const sortedCharts = [...charts].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Graficos ({charts.length})
        </h3>
        <Button onClick={onAddChart} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Grafico
        </Button>
      </div>

      {/* Chart list */}
      {sortedCharts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">Nenhum grafico adicionado ainda</p>
            <p className="text-xs mt-1">
              Clique em "Adicionar Grafico" para comecar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedCharts.map((chart) => (
            <Card key={chart.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {chart.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {chartTypeLabels[chart.chartType] ?? chart.chartType}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Ordem: {chart.displayOrder}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(chart.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(chart.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
