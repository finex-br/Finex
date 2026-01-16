import ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';
import { IExcelAnalyzer } from '../../domain/ports/excel-analyzer.interface';

/**
 * ExcelAnalyzerAdapter - Infrastructure Layer
 * 
 * Analisa estrutura de arquivos Excel sem processar os dados completamente.
 * Extrai apenas headers e sample rows para permitir mapeamento manual.
 */
@Injectable()
export class ExcelAnalyzerAdapter implements IExcelAnalyzer {
  async analyzeStructure(fileBuffer: Buffer): Promise<{
    headers: string[];
    rows: any[][];
    totalRows: number;
    rowNumbers?: number[];
  }> {
    // 1. Ler o arquivo Excel com ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    
    const worksheet = workbook.worksheets[0]; // Primeira planilha
    if (!worksheet) {
      throw new Error('Planilha vazia ou inválida');
    }

    // 2. Extrair cabeçalhos (primeira linha)
    // IMPORTANTE: manter alinhamento correto entre headers e rows.
    // ExcelJS é 1-based (colNumber começa em 1). Internamente usamos arrays 0-based.
    const headerRow = worksheet.getRow(1);
    const rawHeaders: string[] = [];

    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const value = cell.value;

      // Lidar com células que podem ter objetos (como rich text)
      if (value && typeof value === 'object') {
        if ('richText' in value) {
          rawHeaders[colNumber - 1] = (value as any).richText
            .map((rt: any) => rt.text)
            .join('');
        } else if ('text' in value) {
          rawHeaders[colNumber - 1] = (value as any).text;
        } else {
          rawHeaders[colNumber - 1] = String(value);
        }
      } else {
        rawHeaders[colNumber - 1] = value?.toString() || '';
      }
    });

    // Remover apenas colunas SEM header (e remover as células correspondentes nas linhas)
    const indicesToKeep = rawHeaders
      .map((h, idx) => ({ h: (h || '').trim(), idx }))
      .filter(x => x.h !== '')
      .map(x => x.idx);

    const cleanHeaders = indicesToKeep.map(idx => (rawHeaders[idx] || '').toString().trim());

    if (cleanHeaders.length === 0) {
      throw new Error('Nenhum cabeçalho encontrado na primeira linha');
    }

    // 3. Extrair todas as linhas de dados
    const rows: any[][] = [];
    const rowNumbers: number[] = [];
    let totalRows = 0;

    worksheet.eachRow((row, rowNumber) => {
      // Pular cabeçalho
      if (rowNumber === 1) return;

      const rowValues: any[] = [];
      let hasData = false;

      // Ler somente as colunas que possuem header
      for (const headerIndex of indicesToKeep) {
        const cell = row.getCell(headerIndex + 1); // +1 pois ExcelJS é 1-based
        const value = this.extractCellValue(cell as any);
        rowValues.push(value);
        if (value !== null && value !== undefined && value !== '') {
          hasData = true;
        }
      }

      const cleanRow = rowValues;
      if (hasData && cleanRow.length > 0) {
        rows.push(cleanRow);
        rowNumbers.push(rowNumber);
        totalRows++;
      }
    });

    if (totalRows === 0) {
      throw new Error('Nenhuma linha de dados encontrada após o cabeçalho');
    }

    return {
      headers: cleanHeaders,
      rows,
      totalRows,
      rowNumbers,
    };
  }

  /**
   * Extrai valor de uma célula, lidando com diferentes tipos
   */
  private extractCellValue(cell: ExcelJS.Cell): any {
    const value = cell.value;

    if (value === null || value === undefined) {
      return null;
    }

    // Se for Date
    if (value instanceof Date) {
      return value;
    }

    // Se for número
    if (typeof value === 'number') {
      return value;
    }

    // Se for string
    if (typeof value === 'string') {
      return value.trim();
    }

    // Se for objeto (rich text, hyperlink, etc)
    if (typeof value === 'object') {
      if ('richText' in value) {
        return value.richText.map((rt: any) => rt.text).join('');
      }
      
      if ('text' in value) {
        return value.text;
      }

      if ('hyperlink' in value) {
        return value.hyperlink;
      }

      // Fórmula
      if ('result' in value) {
        return value.result;
      }

      // Fallback: converter para string
      return String(value);
    }

    return value;
  }
}
