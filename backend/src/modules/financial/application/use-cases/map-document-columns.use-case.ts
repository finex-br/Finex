import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IPendingDocumentRepository } from '../../domain/ports/pending-document-repository.interface';
import { ColumnMapping } from '../../domain/value-objects/column-mapping';
import {
  MapDocumentColumnsRequestDTO,
  MapDocumentColumnsResponseDTO,
} from '../dtos/pending-document.dto';

/**
 * MapDocumentColumnsUseCase - Application Layer
 * 
 * Define o mapeamento entre colunas do Excel e campos esperados.
 * Atualiza status do documento para MAPPED.
 * 
 * Fluxo:
 * 1. Busca documento pendente
 * 2. Valida que está em status UPLOADED
 * 3. Cria Value Object ColumnMapping
 * 4. Atualiza documento
 * 5. Persiste mudanças
 */
export class MapDocumentColumnsUseCase
  implements IUseCase<MapDocumentColumnsRequestDTO, MapDocumentColumnsResponseDTO>
{
  constructor(private pendingDocumentRepository: IPendingDocumentRepository) {}

  async execute(
    request: MapDocumentColumnsRequestDTO,
  ): Promise<MapDocumentColumnsResponseDTO> {
    // 1. Validar request
    if (!request.documentId || !request.userId) {
      throw new Error('DocumentId e UserId são obrigatórios');
    }

    if (!request.columnMapping) {
      throw new Error('Column mapping é obrigatório');
    }

    // 2. Buscar documento
    const document = await this.pendingDocumentRepository.findById(request.documentId);

    if (!document) {
      throw new Error(`Documento ${request.documentId} não encontrado`);
    }

    // 3. Validar permissões: Simplificado - assume que o JWT já validou o acesso
    // TODO: Verificar company_members se necessário para controle granular

    // 4. Criar Value Object ColumnMapping
    const mappingResult = ColumnMapping.create(request.columnMapping);
    
    if (mappingResult.isFailure) {
      throw new Error(mappingResult.error);
    }

    const mapping = mappingResult.getValue();

    // 5. Validar que as colunas mapeadas existem no documento
    const headers = document.rawData.headers;
    const mappingValues = Object.values(mapping.toJSON()).filter(Boolean) as string[];
    
    for (const columnName of mappingValues) {
      if (!headers.includes(columnName)) {
        throw new Error(
          `Coluna "${columnName}" não encontrada no documento. ` +
          `Colunas disponíveis: ${headers.join(', ')}`
        );
      }
    }

    // 6. Atualizar documento com mapeamento
    const updateResult = document.setColumnMapping(mapping);
    
    if (updateResult.isFailure) {
      throw new Error(updateResult.error);
    }

    // 7. Persistir mudanças
    await this.pendingDocumentRepository.save(document);

    // 8. Retornar sucesso
    return {
      success: true,
      message: 'Mapeamento de colunas definido com sucesso. Pronto para validação.',
      documentId: document.id,
    };
  }
}
