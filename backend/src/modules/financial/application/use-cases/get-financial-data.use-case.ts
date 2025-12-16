import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import {
  GetFinancialDataRequestDTO,
  GetFinancialDataResponseDTO,
  PeriodType,
} from '../dtos/financial.dto';
import { PeriodFilter } from '../../domain/value-objects/period-filter';

/**
 * GetFinancialDataUseCase - Application Layer
 * 
 * Busca dados financeiros agregados para o dashboard:
 * - Summary (receita total, despesa total, lucro)
 * - Monthly Data (dados mensais para gráfico)
 * - Category Data (dados por categoria)
 * - Trend Data (tendência ao longo do tempo)
 * 
 * Suporta filtros de período (WEEK, MONTH, QUARTER, SEMESTER, YEAR, CUSTOM)
 */
export class GetFinancialDataUseCase
  implements IUseCase<GetFinancialDataRequestDTO, GetFinancialDataResponseDTO>
{
  constructor(private financialRepository: IFinancialRepository) {}

  async execute(
    request: GetFinancialDataRequestDTO,
  ): Promise<GetFinancialDataResponseDTO> {
    // 1. Validar request
    if (!request.companyId || !request.userId) {
      throw new Error('CompanyId e UserId são obrigatórios');
    }

    // 2. Processar filtro de período
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let periodType: PeriodType = PeriodType.YEAR; // Default
    let granularity: 'day' | 'week' | 'month' = 'month'; // Default

    if (request.periodFilter) {
      // Criar Value Object com validações
      const periodFilterOrError = PeriodFilter.create({
        type: request.periodFilter.type,
        startDate: request.periodFilter.startDate
          ? new Date(request.periodFilter.startDate)
          : undefined,
        endDate: request.periodFilter.endDate
          ? new Date(request.periodFilter.endDate)
          : undefined,
      });

      if (periodFilterOrError.isFailure) {
        throw new Error(periodFilterOrError.error);
      }

      const periodFilterVO = periodFilterOrError.getValue();
      const dateRange = periodFilterVO.getDateRange();
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
      periodType = request.periodFilter.type;

      // Definir granularidade com base no período
      if (periodType === PeriodType.WEEK) granularity = 'day';
      else if (periodType === PeriodType.MONTH) granularity = 'day';
      else if (periodType === PeriodType.QUARTER || periodType === PeriodType.SEMESTER)
        granularity = 'week';
      else granularity = 'month';
    }

    // 3. Buscar dados do repositório (em paralelo para performance)
    const [summary, monthlyData, categoryData, trendData] = await Promise.all([
      this.financialRepository.calculateSummary(
        request.companyId,
        request.userId,
        startDate,
        endDate,
      ),
      this.financialRepository.getMonthlyData(
        request.companyId,
        request.userId,
        startDate,
        endDate,
      ),
      this.financialRepository.getCategoryData(
        request.companyId,
        request.userId,
        startDate,
        endDate,
      ),
      this.financialRepository.getTrendData(
        request.companyId,
        request.userId,
        startDate,
        endDate,
        granularity,
      ),
    ]);

    // 4. Retornar resposta expandida
    return {
      summary,
      monthlyData,
      categoryData,
      trendData,
      period: {
        type: periodType,
        startDate: startDate?.toISOString().split('T')[0] || '',
        endDate: endDate?.toISOString().split('T')[0] || '',
      },
    };
  }
}

