import ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';
import { IExcelProcessor } from '../../domain/ports/excel-processor.interface';
import { FinancialTransaction } from '../../domain/entities/financial-transaction';
import { Money } from '../../domain/value-objects/money';
import { TransactionType } from '../../domain/value-objects/transaction-type';
import { Category } from '../../domain/value-objects/category';

/**
 * ExcelProcessorAdapter - Infrastructure Layer
 * 
 * Implementa o processamento de arquivos Excel usando ExcelJS (seguro, sem vulnerabilidades).
 * Extrai dados brutos e converte em Entidades de Domínio.
 */
@Injectable()
export class ExcelProcessorAdapter implements IExcelProcessor {
  async processExcelFile(
    fileBuffer: Buffer,
    companyId: string,
  ): Promise<FinancialTransaction[]> {
    // 1. Ler o arquivo Excel com ExcelJS
    const workbook = new ExcelJS.Workbook();
    // ExcelJS aceita ArrayBuffer ou Buffer
    await workbook.xlsx.load(fileBuffer as any);
    
    const worksheet = workbook.worksheets[0]; // Primeira planilha
    if (!worksheet) {
      throw new Error('Planilha vazia ou inválida');
    }

    // 2. Extrair cabeçalhos (primeira linha)
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value?.toString() || '';
    });

    // Mapear índices de colunas (case-insensitive)
    const columnMap = {
      data: this.findColumnIndex(headers, ['data', 'date']),
      descricao: this.findColumnIndex(headers, ['descrição', 'descricao', 'description']),
      categoria: this.findColumnIndex(headers, ['categoria', 'category']),
      valor: this.findColumnIndex(headers, ['valor', 'amount', 'value']),
      tipo: this.findColumnIndex(headers, ['tipo', 'type']),
    };

    // 3. Processar cada linha e criar entidades de domínio
    const transactions: FinancialTransaction[] = [];

    worksheet.eachRow((row, rowNumber) => {
      // Pular cabeçalho
      if (rowNumber === 1) return;

      try {
        // Extrair campos usando os índices mapeados
        const date = columnMap.data !== -1 
          ? this.parseDate(row.getCell(columnMap.data).value)
          : null;
        
        // Usar data atual se data for inválida ou ausente
        const finalDate = date || new Date();
        
        const description = columnMap.descricao !== -1
          ? (row.getCell(columnMap.descricao).value?.toString() || 'Sem descrição')
          : 'Sem descrição';

        const categoryValue = columnMap.categoria !== -1
          ? (row.getCell(columnMap.categoria).value?.toString() || 'Sem categoria')
          : 'Sem categoria';

        const amount = this.parseNumber(
          columnMap.valor !== -1 ? row.getCell(columnMap.valor).value : null
        );

        // Pular linha se valor for inválido (null)
        if (amount === null) {
          return; // continue
        }

        const typeValue = columnMap.tipo !== -1
          ? (row.getCell(columnMap.tipo).value?.toString() || '')
          : '';

        // Criar Value Objects
        const moneyOrError = Money.create(Math.abs(amount));
        if (moneyOrError.isFailure) {
          console.warn(`Valor inválido: ${amount}`, moneyOrError.error);
          return; // continue
        }

        const categoryOrError = Category.create(categoryValue);
        if (categoryOrError.isFailure) {
          console.warn(
            `Categoria inválida: ${categoryValue}`,
            categoryOrError.error,
          );
          return; // continue
        }

        // Determinar tipo (receita/despesa)
        let transactionType: TransactionType;
        if (
          typeValue.toLowerCase().includes('receit') ||
          typeValue.toLowerCase().includes('revenue')
        ) {
          transactionType = TransactionType.RECEITA;
        } else if (
          typeValue.toLowerCase().includes('despes') ||
          typeValue.toLowerCase().includes('expense')
        ) {
          transactionType = TransactionType.DESPESA;
        } else {
          // Se não tiver tipo, usar o sinal do valor
          transactionType =
            amount >= 0 ? TransactionType.RECEITA : TransactionType.DESPESA;
        }

        // Criar entidade de domínio
        const transactionOrError = FinancialTransaction.create({
          companyId,
          date: finalDate,
          description,
          amount: moneyOrError.getValue(),
          type: transactionType,
          category: categoryOrError.getValue(),
          competenceDate: finalDate, // Por padrão, mesma data
          paymentDate: finalDate,
        });

        if (transactionOrError.isSuccess) {
          transactions.push(transactionOrError.getValue());
        } else {
          console.warn('Transação inválida:', transactionOrError.error);
        }
      } catch (error) {
        console.warn('Erro ao processar linha do Excel:', error.message);
        // Continua processando as outras linhas
      }
    });

    return transactions;
  }

  /**
   * Encontra o índice da coluna baseado em possíveis nomes (case-insensitive)
   */
  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (let i = 1; i < headers.length; i++) {
      const header = (headers[i] || '').toLowerCase();
      if (possibleNames.some(name => header.includes(name.toLowerCase()))) {
        return i;
      }
    }
    // Se não encontrou, retorna -1 (coluna não existe)
    return -1;
  }

  /**
   * Converte valor de célula para número
   * Retorna null se o valor for inválido (para pular linha)
   */
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(',', '.'));
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  }

  /**
   * Parseia datas em diferentes formatos (ExcelJS já converte datas seriais automaticamente)
   * Retorna null se a data for inválida (para pular linha)
   */
  private parseDate(dateValue: any): Date | null {
    if (!dateValue) {
      return null;
    }

    // Se já é uma Date (ExcelJS converte automaticamente)
    if (dateValue instanceof Date) {
      return dateValue;
    }

    // Se é string, tentar parsear
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // Se é número serial do Excel (fallback)
    if (typeof dateValue === 'number') {
      // Excel serial date: dias desde 1/1/1900
      const excelEpoch = new Date(1900, 0, 1);
      const days = dateValue - 2; // -2 para corrigir bug do Excel (1900 não é bissexto)
      return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
    }

    return null;
  }
}
