import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDatasetRepository } from '../../domain/ports/dataset-repository.interface';
import { IDatasetRowsRepository } from '../../domain/ports/dataset-rows-repository.interface';
import {
  GetDatasetPreviewRequestDTO,
  GetDatasetPreviewResponseDTO,
} from '../dtos/dataset.dto';

@Injectable()
export class GetDatasetPreviewUseCase
  implements IUseCase<GetDatasetPreviewRequestDTO, GetDatasetPreviewResponseDTO>
{
  constructor(
    @Inject('IDatasetRepository')
    private readonly datasetRepo: IDatasetRepository,
    @Inject('IDatasetRowsRepository')
    private readonly rowsRepo: IDatasetRowsRepository,
  ) {}

  async execute(
    request: GetDatasetPreviewRequestDTO,
  ): Promise<GetDatasetPreviewResponseDTO> {
    const dataset = await this.datasetRepo.findById(request.datasetId);

    if (!dataset || dataset.companyId !== request.companyId) {
      throw new NotFoundException('Dataset not found');
    }

    const limit = request.limit ?? 50;
    const offset = request.offset ?? 0;

    const rows = await this.rowsRepo.findByDatasetId(
      request.datasetId,
      limit,
      offset,
    );

    return {
      id: dataset.id.toString(),
      name: dataset.name,
      columns: dataset.columns,
      rows: rows.map((r) => r.rowData),
      totalRows: dataset.rowCount,
    };
  }
}
