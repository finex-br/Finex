import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IPendingDocumentRepository } from '../../domain/ports/pending-document-repository.interface';
import { Money } from '../../domain/value-objects/money';
import { TransactionType } from '../../domain/value-objects/transaction-type';
import { Category } from '../../domain/value-objects/category';
import {
  ValidateDocumentRequestDTO,
  ValidateDocumentResponseDTO,
} from '../dtos/pending-document.dto';

/**
 * ValidateDocumentUseCase - Application Layer
 * 
 * Valida os dados do documento usando as regras de domínio.
 * Atualiza status para VALIDATED e armazena resultado da validação.
 * 
 * Fluxo:
 * 1. Busca documento com status MAPPED
 * 2. Para cada linha, tenta criar Value Objects (Money, Category, etc)
 * 3. Coleta erros e warnings
 * 4. Atualiza documento com resultado
 * 5. Retorna estatísticas
 */
export class ValidateDocumentUseCase
  implements IUseCase<ValidateDocumentRequestDTO, ValidateDocumentResponseDTO>
{
  constructor(private pendingDocumentRepository: IPendingDocumentRepository) {}

  async execute(
    request: ValidateDocumentRequestDTO,
  ): Promise<ValidateDocumentResponseDTO> {
    // 1. Validar request
    if (!request.documentId || !request.userId) {
      throw new Error('DocumentId e UserId são obrigatórios');
    }

    // 2. Buscar documento
    const document = await this.pendingDocumentRepository.findById(request.documentId);

    if (!document) {
      throw new Error(`Documento ${request.documentId} não encontrado`);
    }

    // 3. Validar permissões: Simplificado - assume que o JWT já validou o acesso
    // TODO: Verificar company_members se necessário para controle granular

    // 4. Verificar se tem mapeamento
    if (!document.columnMapping) {
      throw new Error('Documento não possui mapeamento de colunas definido');
    }

    if (!document.status.isMapped()) {
      throw new Error('Documento deve estar em status MAPPED para ser validado');
    }

    // 5. Validar cada linha
    const errors: Array<{ row: number; field: string; message: string }> = [];
    const warnings: Array<{ row: number; field: string; message: string }> = [];
    let validTransactions = 0;
    let invalidTransactions = 0;

    const { headers, rows, rowNumbers } = document.rawData as any;
    const mapping = document.columnMapping;
    const mappingJson = mapping.toJSON() as any;
    const excludedRows: number[] = Array.isArray(mappingJson?.excludedRows)
      ? mappingJson.excludedRows
      : [];

    // Criar índice de colunas
    const getColumnIndex = (columnName?: string): number => {
      if (!columnName) return -1;
      return headers.indexOf(columnName);
    };

    const dateIndex = getColumnIndex(mapping.date);
    const amountIndex = getColumnIndex(mapping.amount);
    const descriptionIndex = getColumnIndex(mapping.description);
    const categoryIndex = getColumnIndex(mapping.category);
    const typeIndex = getColumnIndex(mapping.type);

    // Validar cada linha
    rows.forEach((row, index) => {
      const rowNumber = Array.isArray(rowNumbers) && rowNumbers[index]
        ? rowNumbers[index]
        : index + 2; // fallback: assume contíguo
      let hasError = false;

      // Ignorar linhas marcadas como excluídas
      if (excludedRows.includes(rowNumber)) {
        return;
      }

      const overridesForRow = mappingJson?.overrides?.[String(rowNumber)] || {};

      // Validar Data
      if (dateIndex === -1) {
        errors.push({
          row: rowNumber,
          field: 'date',
          message: 'Coluna de data não encontrada',
        });
        hasError = true;
      } else {
        const dateValue =
          overridesForRow.date !== undefined ? overridesForRow.date : row[dateIndex];
        if (!dateValue) {
          errors.push({
            row: rowNumber,
            field: 'date',
            message: 'Data é obrigatória',
          });
          hasError = true;
        } else {
          // Tentar parsear data
          const parsedDate = this.parseDate(dateValue);
          if (!parsedDate) {
            errors.push({
              row: rowNumber,
              field: 'date',
              message: `Data inválida: ${dateValue}`,
            });
            hasError = true;
          }
        }
      }

      // Validar Amount (Money)
      if (amountIndex === -1) {
        errors.push({
          row: rowNumber,
          field: 'amount',
          message: 'Coluna de valor não encontrada',
        });
        hasError = true;
      } else {
        const amountValue =
          overridesForRow.amount !== undefined ? overridesForRow.amount : row[amountIndex];
        if (amountValue === null || amountValue === undefined || String(amountValue).trim() === '') {
          errors.push({
            row: rowNumber,
            field: 'amount',
            message: 'Valor é obrigatório',
          });
          hasError = true;
        }

        const parsedAmount = hasError ? null : this.parseNumber(amountValue);
        
        if (parsedAmount === null) {
          if (!hasError) {
            errors.push({
              row: rowNumber,
              field: 'amount',
              message: `Valor inválido: ${amountValue}`,
            });
            hasError = true;
          }
        } else {
          const moneyResult = Money.create(parsedAmount);
          if (moneyResult.isFailure) {
            errors.push({
              row: rowNumber,
              field: 'amount',
              message: moneyResult.error || 'Valor inválido',
            });
            hasError = true;
          }
        }
      }

      // Validar Description (opcional, mas avisar se vazio)
      if (descriptionIndex !== -1) {
        const description =
          overridesForRow.description !== undefined
            ? overridesForRow.description
            : row[descriptionIndex];
        if (!description || description.toString().trim() === '') {
          warnings.push({
            row: rowNumber,
            field: 'description',
            message: 'Descrição vazia',
          });
        }
      }

      // Validar Category (opcional)
      if (categoryIndex !== -1) {
        const categoryValue =
          overridesForRow.category !== undefined
            ? overridesForRow.category
            : row[categoryIndex];
        if (categoryValue) {
          const categoryResult = Category.create(categoryValue.toString());
          if (categoryResult.isFailure) {
            warnings.push({
              row: rowNumber,
              field: 'category',
              message: categoryResult.error || 'Categoria inválida',
            });
          }
        }
      }

      // Validar Type (opcional)
      if (typeIndex !== -1) {
        const typeValue =
          overridesForRow.type !== undefined ? overridesForRow.type : row[typeIndex];
        if (typeValue) {
          const typeString = typeValue.toString().toLowerCase();
          if (
            !typeString.includes('receit') &&
            !typeString.includes('revenue') &&
            !typeString.includes('despes') &&
            !typeString.includes('expense')
          ) {
            warnings.push({
              row: rowNumber,
              field: 'type',
              message: `Tipo não reconhecido: ${typeValue}`,
            });
          }
        }
      }

      // Contar transações válidas/inválidas
      if (hasError) {
        invalidTransactions++;
      } else {
        validTransactions++;
      }
    });

    // 6. Criar resultado da validação
    // Regra: documento pode ser aprovado se existir ao menos 1 transação válida.
    // Linhas inválidas permanecem em `errors` e serão ignoradas no approve.
    const validationResult = {
      isValid: validTransactions > 0,
      errors,
      warnings,
      validTransactions,
      invalidTransactions,
    };

    // 7. Atualizar documento
    const updateResult = document.setValidationResult(validationResult);
    
    if (updateResult.isFailure) {
      throw new Error(updateResult.error);
    }

    // 8. Persistir
    await this.pendingDocumentRepository.save(document);

    // 9. Retornar resultado
    return {
      success: true,
      documentId: document.id,
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      validTransactions: validationResult.validTransactions,
      invalidTransactions: validationResult.invalidTransactions,
      message:
        validTransactions > 0
          ? (errors.length > 0
              ? `Validação parcial: ${validTransactions} válidas, ${invalidTransactions} inválidas (${errors.length} erros), ${warnings.length} avisos`
              : `Validação concluída: ${validTransactions} transações válidas, ${warnings.length} avisos`)
          : `Validação falhou: ${errors.length} erros, ${invalidTransactions} transações inválidas`,
    };
  }

  /**
   * Parseia datas em vários formatos
   */
  private parseDate(value: any): Date | null {
    if (!value) return null;

    // Se já for Date
    if (value instanceof Date) return value;

    // Se for número (Excel serial date)
    if (typeof value === 'number') {
      const date = new Date((value - 25569) * 86400 * 1000);
      return isNaN(date.getTime()) ? null : date;
    }

    // Se for string
    if (typeof value === 'string') {
      // Formatos: YYYY-MM-DD, DD/MM/YYYY, etc
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date;

      // Tentar formato DD/MM/YYYY
      const parts = value.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }
    }

    return null;
  }

  /**
   * Parseia números
   */
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;

    // Se já for número
    if (typeof value === 'number') return value;

    // Se for string, limpar e converter
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }

    return null;
  }
}
