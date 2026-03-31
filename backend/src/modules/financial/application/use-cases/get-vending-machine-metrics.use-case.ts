import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import {
  GetVendingMachineMetricsRequestDTO,
  GetVendingMachineMetricsResponseDTO,
} from '../dtos/vending-machine-metrics.dto';

/**
 * GetVendingMachineMetricsUseCase - Application Layer
 * 
 * Orquestra a recuperação de métricas operacionais para máquinas de vending.
 * Segue o mesmo padrão de GetFinancialDataUseCase.
 * 
 * Responsabilidades:
 * - Validar período de filtro
 * - Chamar repositório para agregar dados do JSONB operational_metadata
 * - Calcular estatísticas de resumo
 * - Retornar DTO estruturado para o controller
 */
@Injectable()
export class GetVendingMachineMetricsUseCase
  implements IUseCase<GetVendingMachineMetricsRequestDTO, GetVendingMachineMetricsResponseDTO>
{
  constructor(
    @Inject('IFinancialRepository')
    private readonly financialRepository: IFinancialRepository,
  ) {}

  async execute(
    request: GetVendingMachineMetricsRequestDTO,
  ): Promise<GetVendingMachineMetricsResponseDTO> {
    console.log('[GetVendingMachineMetricsUseCase] execute:', {
      companyId: request.companyId,
      userId: request.userId,
      startDate: request.startDate,
      endDate: request.endDate,
    });

    const { companyId, startDate, endDate } = request;

    // 1. Buscar métricas operacionais em paralelo
    const [
      salesByMachine,
      productMix,
      hardwareHealth,
      averageTicketTrend,
    ] = await Promise.all([
      this.financialRepository.getSalesVolumeByMachine(companyId, startDate, endDate),
      this.financialRepository.getProductMixPerformance(companyId, startDate, endDate),
      this.financialRepository.getHardwareHealthStatus(companyId),
      this.financialRepository.getAverageTicketTrend(companyId, startDate, endDate, 'day'),
    ]);

    // 2. Calcular estatísticas de resumo
    const totalMachines = salesByMachine.length;
    const totalSales = salesByMachine.reduce((sum, m) => sum + m.totalSales, 0);
    const totalRevenue = salesByMachine.reduce((sum, m) => sum + m.totalRevenue, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    const healthyMachines = hardwareHealth.filter(h => h.status === 'HEALTHY').length;
    const warningMachines = hardwareHealth.filter(h => h.status === 'WARNING').length;
    const criticalMachines = hardwareHealth.filter(h => h.status === 'CRITICAL').length;

    // 3. Montar resposta
    return {
      salesByMachine,
      productMix,
      hardwareHealth,
      averageTicketTrend,
      summary: {
        totalMachines,
        totalSales,
        totalRevenue,
        averageTicket,
        healthyMachines,
        warningMachines,
        criticalMachines,
      },
    };
  }
}
