import * as XLSX from 'xlsx';
import { Injectable } from '@nestjs/common';
import { IExcelProcessor } from '../../domain/ports/excel-processor.interface';
import { FinancialTransaction } from '../../domain/entities/financial-transaction';
import { Money } from '../../domain/value-objects/money';
import { TransactionType } from '../../domain/value-objects/transaction-type';
import { Category } from '../../domain/value-objects/category';

/**
 * ExcelProcessorAdapter - Infrastructure Layer
 * 
 * Implementa o processamento de arquivos Excel.
 * Extrai dados brutos e converte em Entidades de Domínio.
 */
@Injectable()
export class ExcelProcessorAdapter implements IExcelProcessor {
  async processExcelFile(
    fileBuffer: Buffer,
    companyId: string,
  ): Promise<FinancialTransaction[]> {
    // 1. Ler o arquivo Excel
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // 2. Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

    // 3. Processar cada linha e criar entidades de domínio
    const transactions: FinancialTransaction[] = [];

    for (const row of jsonData) {
      try {
        // Extrair campos (flexível para diferentes formatos)
        const date = this.parseDate(
          row['Data'] || row['data'] || row['DATE'] || row['date'],
        );
        
        const description =
          row['Descrição'] ||
          row['descricao'] ||
          row['DESCRIPTION'] ||
          row['description'] ||
          row['Descricao'] ||
          'Sem descrição';

        const categoryValue =
          row['Categoria'] ||
          row['categoria'] ||
          row['CATEGORY'] ||
          row['category'] ||
          'Sem categoria';

        const amount = parseFloat(
          row['Valor'] ||
            row['valor'] ||
            row['AMOUNT'] ||
            row['amount'] ||
            row['Value'] ||
            row['value'] ||
            0,
        );

        const typeValue =
          row['Tipo'] || row['tipo'] || row['TYPE'] || row['type'] || '';

        // Criar Value Objects
        const moneyOrError = Money.create(Math.abs(amount));
        if (moneyOrError.isFailure) {
          console.warn(`Valor inválido: ${amount}`, moneyOrError.error);
          continue;
        }

        const categoryOrError = Category.create(categoryValue);
        if (categoryOrError.isFailure) {
          console.warn(
            `Categoria inválida: ${categoryValue}`,
            categoryOrError.error,
          );
          continue;
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
          date,
          description,
          amount: moneyOrError.getValue(),
          type: transactionType,
          category: categoryOrError.getValue(),
          competenceDate: date, // Por padrão, mesma data
          paymentDate: date,
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
    }

    return transactions;
  }

  /**
   * Parseia datas em diferentes formatos
   */
  private parseDate(dateValue: any): Date {
    if (!dateValue) {
      return new Date();
    }

    // Se já é uma Date
    if (dateValue instanceof Date) {
      return dateValue;
    }

    // Se é um número (serial do Excel)
    if (typeof dateValue === 'number') {
      const parsedDate = XLSX.SSF.parse_date_code(dateValue);
      return new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d); // m-1 porque Date usa 0-indexed months
    }

    // Se é string, tentar parsear
    const parsed = new Date(dateValue);
    if (isNaN(parsed.getTime())) {
      return new Date();
    }

    return parsed;
  }
}
