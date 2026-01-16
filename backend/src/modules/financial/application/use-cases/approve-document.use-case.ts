import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IPendingDocumentRepository } from '../../domain/ports/pending-document-repository.interface';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import { IExcelProcessor } from '../../domain/ports/excel-processor.interface';
import { DataSource } from 'typeorm';
import {
  ApproveDocumentRequestDTO,
  ApproveDocumentResponseDTO,
} from '../dtos/pending-document.dto';

/**
 * ApproveDocumentUseCase - Application Layer
 * 
 * Aprova um documento validado e importa as transações para a tabela principal.
 * Atualiza status para APPROVED.
 * 
 * Fluxo:
 * 1. Busca documento com status VALIDATED
 * 2. Verifica que não há erros de validação
 * 3. Re-processa o documento usando ExcelProcessor (com mapeamento correto)
 * 4. Importa transações para tabela principal
 * 5. Marca documento como APPROVED
 */
export class ApproveDocumentUseCase
  implements IUseCase<ApproveDocumentRequestDTO, ApproveDocumentResponseDTO>
{
  constructor(
    private pendingDocumentRepository: IPendingDocumentRepository,
    private financialRepository: IFinancialRepository,
    private excelProcessor: IExcelProcessor,
    private dataSource: DataSource,
  ) {}

  async execute(
    request: ApproveDocumentRequestDTO,
  ): Promise<ApproveDocumentResponseDTO> {
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

    // 4. Verificar status
    if (!document.status.isValidated()) {
      throw new Error(
        `Documento deve estar em status VALIDATED para ser aprovado. Status atual: ${document.status.value}`
      );
    }

    // 5. Verificar resultado da validação
    if (!document.validationResult) {
      throw new Error('Documento não possui resultado de validação');
    }

    if (document.validationResult.validTransactions === 0) {
      throw new Error('Documento não possui transações válidas para importar');
    }

    // 6. Re-processar documento com mapeamento correto
    // Criar um Excel temporário com apenas os dados válidos
    const transactions = await this.processDocumentWithMapping(document);

    if (transactions.length === 0) {
      throw new Error('Nenhuma transação foi processada com sucesso');
    }

    // 7. Importar transações para tabela principal
    // Simplificado: insere diretamente no banco usando DataSource
    // Na produção, deveria usar FinancialTransaction.create() + repository.saveBatch()
    for (const tx of transactions) {
      await this.dataSource.query(
        `INSERT INTO financial_data (company_id, upload_id, description, amount, date_competence, date_payment, type, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          tx.companyId,
          tx.uploadId,
          tx.description,
          tx.amount,
          tx.dateCompetence,
          tx.datePayment,
          tx.type,
          tx.category,
        ]
      );
    }

    // 8. Marcar documento como aprovado
    const approveResult = document.approve(request.userId);
    
    if (approveResult.isFailure) {
      throw new Error(approveResult.error);
    }

    // 9. Persistir mudanças
    await this.pendingDocumentRepository.save(document);

    // 10. Retornar sucesso
    return {
      success: true,
      message: `Documento aprovado com sucesso! ${transactions.length} transações importadas.`,
      documentId: document.id,
      transactionsImported: transactions.length,
    };
  }

  /**
   * Re-processa o documento aplicando o mapeamento de colunas
   * e filtrando apenas as linhas válidas
   */
  private async processDocumentWithMapping(document: any): Promise<any[]> {
    const { rawData, columnMapping, validationResult } = document;

    if (!columnMapping) {
      throw new Error('Documento não possui mapeamento de colunas');
    }

    const mapping = columnMapping.toJSON() as any;
    const excludedRows: number[] = Array.isArray(mapping?.excludedRows) ? mapping.excludedRows : [];
    const transactions: any[] = [];

    // Percorre cada linha do raw_data
    const rowNumbers: number[] | undefined = (rawData as any).rowNumbers;

    for (let i = 0; i < rawData.rows.length; i++) {
      const row = rawData.rows[i];
      const rowNumber = Array.isArray(rowNumbers) && rowNumbers[i]
        ? rowNumbers[i]
        : i + 2; // fallback

      if (excludedRows.includes(rowNumber)) {
        continue;
      }

      // Verifica se esta linha tem erros na validação
      const hasErrors = validationResult?.errors?.some(err => err.row === rowNumber);
      
      if (hasErrors) {
        continue; // Pula linhas com erro
      }

      try {
        // Extrai valores usando o mapeamento
        const dateIndex = rawData.headers.indexOf(mapping.date);
        const descriptionIndex = rawData.headers.indexOf(mapping.description);
        const amountIndex = rawData.headers.indexOf(mapping.amount);
        const typeIndex = rawData.headers.indexOf(mapping.type);
        const categoryIndex = rawData.headers.indexOf(mapping.category);

        const overridesForRow = mapping?.overrides?.[String(rowNumber)] || {};

        const dateValue = overridesForRow.date !== undefined ? overridesForRow.date : row[dateIndex];
        const descriptionValue =
          overridesForRow.description !== undefined ? overridesForRow.description : row[descriptionIndex];
        const amountValue = overridesForRow.amount !== undefined ? overridesForRow.amount : row[amountIndex];
        const typeValue = overridesForRow.type !== undefined ? overridesForRow.type : row[typeIndex];
        const categoryValue = overridesForRow.category !== undefined ? overridesForRow.category : row[categoryIndex];

        // Valida se todos os campos obrigatórios estão presentes
        if (!dateValue || amountValue === null || amountValue === undefined || String(amountValue).trim() === '') {
          continue; // Pula linhas incompletas
        }

        // Cria transação (simplificado - na prática usar FinancialTransaction.create())
        transactions.push({
          companyId: document.companyId,
          uploadId: document.id, // Rastreabilidade!
          description: descriptionValue || '',
          amount: typeof amountValue === 'number' ? amountValue : parseFloat(String(amountValue).replace(',', '.')),
          dateCompetence: this.parseDate(dateValue),
          datePayment: this.parseDate(dateValue), // Usa mesma data se não houver datePayment
          type: typeValue || 'RECEITA',
          category: categoryValue || 'Outros',
        });
      } catch (error) {
        console.error(`Erro ao processar linha ${rowNumber}:`, error);
        // Continua processando outras linhas
      }
    }

    return transactions;
  }

  /**
   * Converte valor de data do Excel para Date
   */
  private parseDate(value: any): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'number') {
      // Excel armazena datas como números (days since 1900-01-01)
      const epoch = new Date(1900, 0, 1);
      return new Date(epoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
    }

    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // Fallback: data atual
    return new Date();
  }
}