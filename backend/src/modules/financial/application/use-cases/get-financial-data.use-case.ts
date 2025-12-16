import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import {
  GetFinancialDataRequestDTO,
  GetFinancialDataResponseDTO,
} from '../dtos/financial.dto';

/**
 * GetFinancialDataUseCase - Application Layer
 * 
 * Busca dados financeiros agregados para o dashboard:
 * - Summary (receita total, despesa total, lucro)
 * - Monthly Data (dados mensais para gráfico)
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

    // TODO: Validar se o userId tem permissão na companyId

    // 2. Buscar summary (agregações no DuckDB)
    const summary = await this.financialRepository.calculateSummary(
      request.companyId,
    );

    // 3. Buscar dados mensais
    const monthlyData = await this.financialRepository.getMonthlyData(
      request.companyId,
    );

    // 4. Retornar resposta
    return {
      summary,
      monthlyData,
    };
  }
}
