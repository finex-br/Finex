import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ColumnInfo {
  name: string;
  type: string;
}

interface ColumnMapperProps {
  columns: ColumnInfo[];
  xAxis: string | undefined;
  yAxis: string[] | undefined;
  colorBy: string | undefined;
  onXAxisChange: (col: string) => void;
  onYAxisChange: (cols: string[]) => void;
  onColorByChange: (col: string | undefined) => void;
  chartType: string;
}

const NONE_VALUE = '__none__';

export function ColumnMapper({
  columns,
  xAxis,
  yAxis,
  colorBy,
  onXAxisChange,
  onYAxisChange,
  onColorByChange,
  chartType,
}: ColumnMapperProps) {
  const handleYAxisToggle = (colName: string, checked: boolean) => {
    const current = yAxis ?? [];
    if (checked) {
      onYAxisChange([...current, colName]);
    } else {
      onYAxisChange(current.filter((c) => c !== colName));
    }
  };

  // KPI type: show only a single "Value" select
  if (chartType === 'KPI') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Valor</Label>
          <Select
            value={yAxis?.[0] ?? ''}
            onValueChange={(val) => onYAxisChange([val])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a coluna de valor" />
            </SelectTrigger>
            <SelectContent>
              {columns
                .filter((col) => col.type === 'number')
                .map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name}
                  </SelectItem>
                ))}
              {columns.filter((col) => col.type === 'number').length === 0 && (
                <SelectItem value="__no_numeric__" disabled>
                  Nenhuma coluna numerica disponivel
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Selecione a coluna numerica a ser exibida como indicador
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* X Axis */}
      <div className="space-y-2">
        <Label>Eixo X</Label>
        <Select value={xAxis ?? ''} onValueChange={onXAxisChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a coluna do eixo X" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => (
              <SelectItem key={col.name} value={col.name}>
                <span className="flex items-center gap-2">
                  {col.name}
                  <span className="text-xs text-muted-foreground">
                    ({col.type})
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Y Axis (multi-select with checkboxes) */}
      <div className="space-y-2">
        <Label>Eixo Y (colunas de valor)</Label>
        <div className="rounded-md border p-3 space-y-2 max-h-48 overflow-y-auto">
          {columns
            .filter((col) => col.type === 'number')
            .map((col) => {
              const isChecked = yAxis?.includes(col.name) ?? false;
              return (
                <div key={col.name} className="flex items-center gap-2">
                  <Checkbox
                    id={`y-axis-${col.name}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleYAxisToggle(col.name, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`y-axis-${col.name}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {col.name}
                  </Label>
                </div>
              );
            })}
          {columns.filter((col) => col.type === 'number').length === 0 && (
            <p className="text-xs text-muted-foreground py-1">
              Nenhuma coluna numerica disponivel
            </p>
          )}
        </div>
        {yAxis && yAxis.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {yAxis.length} coluna{yAxis.length > 1 ? 's' : ''} selecionada
            {yAxis.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Color By (optional) */}
      <div className="space-y-2">
        <Label>Agrupar por cor (opcional)</Label>
        <Select
          value={colorBy ?? NONE_VALUE}
          onValueChange={(val) =>
            onColorByChange(val === NONE_VALUE ? undefined : val)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a coluna (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>Nenhum</SelectItem>
            {columns
              .filter((col) => col.type === 'string')
              .map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
