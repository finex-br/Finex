import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDatasetRepository } from '../../domain/ports/dataset-repository.interface';
import { IDatasetRowsRepository } from '../../domain/ports/dataset-rows-repository.interface';
import {
  DownloadDatasetRequestDTO,
  DownloadDatasetResponseDTO,
} from '../dtos/dataset.dto';

@Injectable()
export class DownloadDatasetUseCase
  implements IUseCase<DownloadDatasetRequestDTO, DownloadDatasetResponseDTO>
{
  constructor(
    @Inject('IDatasetRepository')
    private readonly datasetRepo: IDatasetRepository,
    @Inject('IDatasetRowsRepository')
    private readonly rowsRepo: IDatasetRowsRepository,
  ) {}

  async execute(
    request: DownloadDatasetRequestDTO,
  ): Promise<DownloadDatasetResponseDTO> {
    const dataset = await this.datasetRepo.findById(request.datasetId);

    if (!dataset || dataset.companyId !== request.companyId) {
      throw new NotFoundException('Dataset not found');
    }

    const allRows = await this.rowsRepo.findByDatasetId(request.datasetId);

    return {
      fileName: dataset.fileName,
      columns: dataset.columns.map((c) => c.name),
      rows: allRows.map((r) => r.rowData),
    };
  }
}
