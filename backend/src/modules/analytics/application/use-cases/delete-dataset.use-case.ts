import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDatasetRepository } from '../../domain/ports/dataset-repository.interface';
import { IDatasetRowsRepository } from '../../domain/ports/dataset-rows-repository.interface';

interface DeleteDatasetRequest {
  datasetId: string;
  companyId: string;
}

interface DeleteDatasetResponse {
  success: boolean;
}

@Injectable()
export class DeleteDatasetUseCase
  implements IUseCase<DeleteDatasetRequest, DeleteDatasetResponse>
{
  constructor(
    @Inject('IDatasetRepository')
    private readonly datasetRepo: IDatasetRepository,
    @Inject('IDatasetRowsRepository')
    private readonly rowsRepo: IDatasetRowsRepository,
  ) {}

  async execute(
    request: DeleteDatasetRequest,
  ): Promise<DeleteDatasetResponse> {
    const dataset = await this.datasetRepo.findById(request.datasetId);

    if (!dataset || dataset.companyId !== request.companyId) {
      throw new NotFoundException('Dataset not found');
    }

    // Delete rows first
    await this.rowsRepo.deleteByDatasetId(request.datasetId);

    // Soft-delete dataset
    dataset.markDeleted();
    await this.datasetRepo.update(dataset);

    return { success: true };
  }
}
