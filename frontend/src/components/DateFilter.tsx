import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PeriodFilter, PeriodType } from '@/services/financialService';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  periodFilter: PeriodFilter;
  onPeriodChange: (filter: PeriodFilter) => void;
}

/**
 * DateFilter Component
 * 
 * Permite ao usuário selecionar período de análise:
 * - MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL (pré-definidos)
 * - CUSTOM (com date pickers para início e fim)
 */
export const DateFilter = ({ periodFilter, onPeriodChange }: DateFilterProps) => {
  const handlePeriodTypeChange = (value: string) => {
    const newType = value as PeriodType;
    onPeriodChange({
      type: newType,
      // Limpa datas customizadas se mudar para tipo pré-definido
      startDate: newType === PeriodType.CUSTOM ? periodFilter.startDate : undefined,
      endDate: newType === PeriodType.CUSTOM ? periodFilter.endDate : undefined,
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      onPeriodChange({
        ...periodFilter,
        startDate: format(date, 'yyyy-MM-dd'),
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      onPeriodChange({
        ...periodFilter,
        endDate: format(date, 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Select de Período */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Select value={periodFilter.type} onValueChange={handlePeriodTypeChange}>
          <SelectTrigger id="period-select" className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PeriodType.MENSAL}>Mensal</SelectItem>
            <SelectItem value={PeriodType.TRIMESTRAL}>Trimestral</SelectItem>
            <SelectItem value={PeriodType.SEMESTRAL}>Semestral</SelectItem>
            <SelectItem value={PeriodType.ANUAL}>Anual</SelectItem>
            <SelectItem value={PeriodType.CUSTOM}>Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Pickers (apenas para CUSTOM) */}
      {periodFilter.type === PeriodType.CUSTOM && (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          {/* Data Início */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[180px] justify-start text-left font-normal',
                  !periodFilter.startDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {periodFilter.startDate ? (
                  format(new Date(periodFilter.startDate), 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  <span>Data inicial</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={periodFilter.startDate ? new Date(periodFilter.startDate) : undefined}
                onSelect={handleStartDateChange}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {/* Data Fim */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[180px] justify-start text-left font-normal',
                  !periodFilter.endDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {periodFilter.endDate ? (
                  format(new Date(periodFilter.endDate), 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  <span>Data final</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={periodFilter.endDate ? new Date(periodFilter.endDate) : undefined}
                onSelect={handleEndDateChange}
                initialFocus
                locale={ptBR}
                disabled={(date) =>
                  periodFilter.startDate ? date < new Date(periodFilter.startDate) : false
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

