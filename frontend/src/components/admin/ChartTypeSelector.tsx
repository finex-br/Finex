import {
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Hash,
  Table2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface ChartTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

interface ChartTypeOption {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const CHART_TYPES: ChartTypeOption[] = [
  {
    type: 'BAR',
    label: 'Barras',
    icon: BarChart3,
    description: 'Comparar valores entre categorias',
  },
  {
    type: 'LINE',
    label: 'Linha',
    icon: LineChart,
    description: 'Visualizar tendencias ao longo do tempo',
  },
  {
    type: 'PIE',
    label: 'Pizza',
    icon: PieChart,
    description: 'Mostrar proporcoes de um todo',
  },
  {
    type: 'AREA',
    label: 'Area',
    icon: AreaChart,
    description: 'Tendencias com preenchimento',
  },
  {
    type: 'KPI',
    label: 'KPI',
    icon: Hash,
    description: 'Exibir um indicador numerico',
  },
  {
    type: 'TABLE',
    label: 'Tabela',
    icon: Table2,
    description: 'Exibir dados em formato tabular',
  },
];

export function ChartTypeSelector({
  selectedType,
  onSelect,
}: ChartTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {CHART_TYPES.map(({ type, label, icon: Icon, description }) => {
        const isSelected = selectedType === type;
        return (
          <Card
            key={type}
            onClick={() => onSelect(type)}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected
                ? 'ring-2 ring-primary border-primary bg-primary/5'
                : 'hover:border-primary/50',
            )}
          >
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <Icon
                className={cn(
                  'h-8 w-8',
                  isSelected ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-primary' : 'text-foreground',
                )}
              >
                {label}
              </span>
              <span className="text-[11px] text-muted-foreground text-center leading-tight">
                {description}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
