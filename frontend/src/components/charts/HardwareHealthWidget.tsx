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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'CRITICAL':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Saúde das Máquinas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Monitoramento do nível de galão (coffee supply)
          </p>

          {/* Summary badges */}
          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">{healthyCount} OK</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">{warningCount} Atenção</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-md">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">{criticalCount} Crítico</span>
            </div>
          </div>
        </div>

        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
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
                      <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{machine.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-600">Nível Galão: </span>
                        <span className="font-bold">
                          {machine.nivelGalao !== null ? `${machine.nivelGalao}%` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Última atualização: </span>
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

        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          <p>💡 <strong>Crítico:</strong> {'<'}20% | <strong>Atenção:</strong> 20-40% | <strong>OK:</strong> {'>'}40%</p>
        </div>
      </CardContent>
    </Card>
  );
};
