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

interface GraphDateFilterProps {
  periodFilter?: PeriodFilter;
  onPeriodChange: (filter: PeriodFilter) => void;
  companyId?: string;
  onApply?: () => void;
}

/**
 * GraphDateFilter Component
 * 
 * LOTE 5: Filtro de data simplificado para gráficos individuais
 * - Versão mais compacta do DateFilter principal
 * - Design intuitivo para usuários mais velhos
 * - Botão "Aplicar" explícito para confirmar mudanças
 */
export const GraphDateFilter = ({ 
  periodFilter, 
  onPeriodChange,
  onApply,
}: GraphDateFilterProps) => {
  // Estado local para controlar modo CUSTOM (só envia quando aplicar)
  const [localCustomMode, setLocalCustomMode] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<string | undefined>(undefined);
  const [localEndDate, setLocalEndDate] = useState<string | undefined>(undefined);
  const [pendingType, setPendingType] = useState<PeriodType | undefined>(undefined);
  
  // Se não houver filtro, usar MONTH como padrão para a UI
  const currentType = localCustomMode ? PeriodType.CUSTOM : (pendingType || periodFilter?.type || PeriodType.MONTH);
  
  // Sincroniza estado local quando periodFilter muda externamente
  useEffect(() => {
    if (periodFilter?.type === PeriodType.CUSTOM) {
      setLocalCustomMode(true);
      setLocalStartDate(periodFilter.startDate);
      setLocalEndDate(periodFilter.endDate);
      setPendingType(PeriodType.CUSTOM);
    } else {
      setLocalCustomMode(false);
      setLocalStartDate(undefined);
      setLocalEndDate(undefined);
      setPendingType(periodFilter?.type);
    }
  }, [periodFilter]);
  
  const handlePeriodTypeChange = (value: string) => {
    const newType = value as PeriodType;
    setPendingType(newType);
    
    // Se CUSTOM, ativa modo local (mostra date pickers)
    if (newType === PeriodType.CUSTOM) {
      setLocalCustomMode(true);
      setLocalStartDate(undefined);
      setLocalEndDate(undefined);
      return;
    }
    
    // Para períodos pré-definidos, limpa modo local mas não aplica ainda
    setLocalCustomMode(false);
    setLocalStartDate(undefined);
    setLocalEndDate(undefined);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const newStartDate = format(date, 'yyyy-MM-dd');
      setLocalStartDate(newStartDate);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const newEndDate = format(date, 'yyyy-MM-dd');
      setLocalEndDate(newEndDate);
    }
  };

  const handleApply = () => {
    if (localCustomMode) {
      // Modo CUSTOM: precisa de ambas as datas
      if (localStartDate && localEndDate) {
        onPeriodChange({
          type: PeriodType.CUSTOM,
          startDate: localStartDate,
          endDate: localEndDate,
        });
        onApply?.();
      }
    } else if (pendingType) {
      // Período pré-definido: aplica imediatamente
      onPeriodChange({
        type: pendingType,
        startDate: undefined,
        endDate: undefined,
      });
      onApply?.();
    }
  };

  const canApply = localCustomMode 
    ? (localStartDate && localEndDate) 
    : pendingType !== periodFilter?.type;

  return (
    <div className="space-y-3">
      {/* Select de Período */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Select value={currentType} onValueChange={handlePeriodTypeChange}>
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Período" />
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
        <div className="space-y-2">
          {/* Data Início */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'w-full justify-start text-left font-normal text-xs',
                  !localStartDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-3 w-3" />
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
                size="sm"
                className={cn(
                  'w-full justify-start text-left font-normal text-xs',
                  !localEndDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-3 w-3" />
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

      {/* Botão Aplicar */}
      <Button
        onClick={handleApply}
        disabled={!canApply}
        size="sm"
        className="w-full text-sm"
      >
        Aplicar Filtro
      </Button>
    </div>
  );
};
