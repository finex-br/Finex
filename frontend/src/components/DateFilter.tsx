import { useState, useEffect } from 'react';
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
  periodFilter?: PeriodFilter;
  onPeriodChange: (filter: PeriodFilter) => void;
}

/**
 * DateFilter Component
 * 
 * Permite ao usuário selecionar período de análise:
 * - MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL (pré-definidos)
 * - CUSTOM (com date pickers para início e fim)
 * 
 * LOTE 4: Estado local para CUSTOM (só envia ao parent quando ambas datas selecionadas)
 */
export const DateFilter = ({ periodFilter, onPeriodChange }: DateFilterProps) => {
  // Estado local para controlar modo CUSTOM (antes de enviar ao backend)
  const [localCustomMode, setLocalCustomMode] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<string | undefined>(undefined);
  const [localEndDate, setLocalEndDate] = useState<string | undefined>(undefined);
  
  // Se não houver filtro, usar MONTH como padrão para a UI
  const currentType = localCustomMode ? PeriodType.CUSTOM : (periodFilter?.type || PeriodType.MONTH);
  
  // Sincroniza estado local quando periodFilter muda externamente
  useEffect(() => {
    if (periodFilter?.type === PeriodType.CUSTOM) {
      setLocalCustomMode(true);
      setLocalStartDate(periodFilter.startDate);
      setLocalEndDate(periodFilter.endDate);
    } else {
      setLocalCustomMode(false);
      setLocalStartDate(undefined);
      setLocalEndDate(undefined);
    }
  }, [periodFilter]);
  
  const handlePeriodTypeChange = (value: string) => {
    const newType = value as PeriodType;
    
    // LOTE 4: Se CUSTOM, ativa modo local (mostra date pickers sem fazer request)
    if (newType === PeriodType.CUSTOM) {
      setLocalCustomMode(true);
      setLocalStartDate(undefined);
      setLocalEndDate(undefined);
      return;
    }
    
    // Período pré-definido: limpa modo local e notifica parent imediatamente
    setLocalCustomMode(false);
    setLocalStartDate(undefined);
    setLocalEndDate(undefined);
    onPeriodChange({
      type: newType,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const newStartDate = format(date, 'yyyy-MM-dd');
      setLocalStartDate(newStartDate);
      
      // LOTE 4: Só notifica parent se AMBAS datas estiverem selecionadas
      if (localEndDate) {
        onPeriodChange({
          type: PeriodType.CUSTOM,
          startDate: newStartDate,
          endDate: localEndDate,
        });
      }
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const newEndDate = format(date, 'yyyy-MM-dd');
      setLocalEndDate(newEndDate);
      
      // LOTE 4: Só notifica parent se AMBAS datas estiverem selecionadas
      if (localStartDate) {
        onPeriodChange({
          type: PeriodType.CUSTOM,
          startDate: localStartDate,
          endDate: newEndDate,
        });
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Select de Período */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Select value={currentType} onValueChange={handlePeriodTypeChange}>
          <SelectTrigger id="period-select" className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PeriodType.MONTH}>Mensal</SelectItem>
            <SelectItem value={PeriodType.QUARTER}>Trimestral</SelectItem>
            <SelectItem value={PeriodType.SEMESTER}>Semestral</SelectItem>
            <SelectItem value={PeriodType.YEAR}>Anual</SelectItem>
            <SelectItem value={PeriodType.CUSTOM}>Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Pickers (apenas para CUSTOM) */}
      {currentType === PeriodType.CUSTOM && (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          {/* Data Início */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[180px] justify-start text-left font-normal',
                  !localStartDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {localStartDate ? (
                  format(new Date(localStartDate), 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  <span>Data inicial</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={localStartDate ? new Date(localStartDate) : undefined}
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
                  !localEndDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {localEndDate ? (
                  format(new Date(localEndDate), 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  <span>Data final</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={localEndDate ? new Date(localEndDate) : undefined}
                onSelect={handleEndDateChange}
                initialFocus
                locale={ptBR}
                disabled={(date) =>
                  localStartDate ? date < new Date(localStartDate) : false
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

