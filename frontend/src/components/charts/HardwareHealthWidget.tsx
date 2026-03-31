import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { HardwareHealth } from '@/services/vendingMachineService';

interface HardwareHealthWidgetProps {
  hardwareData: HardwareHealth[];
}

/**
 * HardwareHealthWidget - Widget Component
 * 
 * Displays hardware health status for vending machines.
 * Shows nivelGalao (galao level) alerts: HEALTHY, WARNING, CRITICAL.
 */
export const HardwareHealthWidget = ({ hardwareData }: HardwareHealthWidgetProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'CRITICAL':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-success/10 text-success border-success/30';
      case 'WARNING':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'CRITICAL':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'Saudável';
      case 'WARNING':
        return 'Atenção';
      case 'CRITICAL':
        return 'Crítico';
      default:
        return 'Desconhecido';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort: CRITICAL first, then WARNING, then HEALTHY
  const sortedData = [...hardwareData].sort((a, b) => {
    const statusOrder = { CRITICAL: 0, WARNING: 1, HEALTHY: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const healthyCount = hardwareData.filter(d => d.status === 'HEALTHY').length;
  const warningCount = hardwareData.filter(d => d.status === 'WARNING').length;
  const criticalCount = hardwareData.filter(d => d.status === 'CRITICAL').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Saúde das Máquinas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-4">
            Monitoramento do nível de galão (coffee supply)
          </p>

          {/* Summary badges */}
          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/30 rounded-md">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">{healthyCount} OK</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 border border-warning/30 rounded-md">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">{warningCount} Atenção</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 border border-destructive/30 rounded-md">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">{criticalCount} Critico</span>
            </div>
          </div>
        </div>

        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Nenhum dado de hardware disponível
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedData.map((machine) => (
              <div
                key={machine.deviceId}
                className={`p-3 rounded-lg border ${getStatusColor(machine.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(machine.status)}
                      <span className="font-semibold text-sm">{machine.deviceId}</span>
                    </div>

                    {machine.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{machine.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Nível Galão: </span>
                        <span className="font-bold">
                          {machine.nivelGalao !== null ? `${machine.nivelGalao}%` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Última atualização: </span>
                        <span>{formatDate(machine.lastUpdate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(machine.status)}`}>
                      {getStatusLabel(machine.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 <strong>Crítico:</strong> {'<'}20% | <strong>Atenção:</strong> 20-40% | <strong>OK:</strong> {'>'}40%</p>
        </div>
      </CardContent>
    </Card>
  );
};
