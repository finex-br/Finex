import { AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmptyPeriodBannerProps {
  earliestDate: string | null;
  latestDate: string | null;
  onViewAllData: () => void;
}

/**
 * EmptyPeriodBanner - Exibido quando filtro retorna 0 resultados
 * 
 * Lote 4: UX inteligente para evitar confusão do usuário
 * Em vez de desaparecer o dashboard, mostramos banner explicativo
 */
export const EmptyPeriodBanner = ({ 
  earliestDate, 
  latestDate, 
  onViewAllData 
}: EmptyPeriodBannerProps) => {
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mb-6">
      <Alert className="border-primary bg-primary/10">
        <AlertCircle className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-semibold text-base">
          Nenhuma transação encontrada neste período
        </AlertTitle>
        <AlertDescription className="text-primary mt-2">
          <p className="mb-3">
            O filtro aplicado não retornou resultados. Seus dados financeiros vão de{' '}
            <strong>{formatDate(earliestDate)}</strong> até{' '}
            <strong>{formatDate(latestDate)}</strong>.
          </p>
          <Button
            onClick={onViewAllData}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/90"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Ver Todos os Dados
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};
