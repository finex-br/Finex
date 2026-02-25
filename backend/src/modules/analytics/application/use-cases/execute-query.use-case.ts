import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IAnalyticsEngine } from '../../domain/ports/analytics-engine.interface';
import { QueryDefinition } from '../../domain/value-objects/data-source-config';
import {
  ExecuteQueryRequestDTO,
  ExecuteQueryResponseDTO,
} from '../dtos/dataset.dto';

@Injectable()
export class ExecuteQueryUseCase
  implements IUseCase<ExecuteQueryRequestDTO, ExecuteQueryResponseDTO>
{
  constructor(
    @Inject('IAnalyticsEngine')
    private readonly analyticsEngine: IAnalyticsEngine,
  ) {}

  async execute(
    request: ExecuteQueryRequestDTO,
  ): Promise<ExecuteQueryResponseDTO> {
    const queryDefinition: QueryDefinition = {
      datasetId: request.datasetId,
      select: request.select,
      where: request.where,
      groupBy: request.groupBy,
      orderBy: request.orderBy,
      limit: request.limit,
    };

    const result = await this.analyticsEngine.executeQuery(
      queryDefinition,
      request.companyId,
    );

    return {
      columns: result.columns,
      rows: result.rows,
      totalRows: result.totalRows,
    };
  }
}
