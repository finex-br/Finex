import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDatasetRepository } from '../../domain/ports/dataset-repository.interface';
import {
  GetDatasetsRequestDTO,
  DatasetSummaryDTO,
} from '../dtos/dataset.dto';

@Injectable()
export class GetDatasetsUseCase
  implements IUseCase<GetDatasetsRequestDTO, DatasetSummaryDTO[]>
{
  constructor(
    @Inject('IDatasetRepository')
    private readonly datasetRepo: IDatasetRepository,
  ) {}

  async execute(
    request: GetDatasetsRequestDTO,
  ): Promise<DatasetSummaryDTO[]> {
    const datasets = await this.datasetRepo.findByCompanyId(request.companyId);

    return datasets.map((dataset) => ({
      id: dataset.id.toString(),
      name: dataset.name,
      fileName: dataset.fileName,
      fileSize: dataset.fileSize,
      mimeType: dataset.mimeType,
      columns: dataset.columns,
      rowCount: dataset.rowCount,
      status: dataset.status,
      createdAt: dataset.createdAt!,
      updatedAt: dataset.updatedAt!,
    }));
  }
}
