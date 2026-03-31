import { Injectable } from '@nestjs/common';
import * as fastCsv from 'fast-csv';
import { Readable } from 'stream';
import { ColumnInfo, ColumnDataType } from '../../domain/value-objects/column-info';

export interface ParsedFileResult {
  columns: ColumnInfo[];
  rows: Record<string, any>[];
  totalRows: number;
}

@Injectable()
export class CsvParserAdapter {
  async parse(buffer: Buffer): Promise<ParsedFileResult> {
    const rows: Record<string, any>[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(buffer);
      stream
        .pipe(
          fastCsv.parse({
            headers: true,
            trim: true,
            skipLines: 0,
          }),
        )
        .on('data', (row: Record<string, any>) => {
          rows.push(row);
        })
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err));
    });

    if (rows.length === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const headers = Object.keys(rows[0]);
    const columns = headers.map((header) => this.inferColumn(header, rows));

    return {
      columns,
      rows,
      totalRows: rows.length,
    };
  }

  private inferColumn(
    header: string,
    rows: Record<string, any>[],
  ): ColumnInfo {
    const sampleSize = Math.min(rows.length, 20);
    const sampleValues: string[] = [];
    let numberCount = 0;
    let dateCount = 0;
    let boolCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const value = rows[i][header];
      if (value === null || value === undefined || value === '') continue;

      const strValue = String(value).trim();
      sampleValues.push(strValue);

      if (this.isNumber(strValue)) numberCount++;
      else if (this.isDate(strValue)) dateCount++;
      else if (this.isBoolean(strValue)) boolCount++;
    }

    const validSamples = sampleValues.length;
    let type = ColumnDataType.STRING;

    if (validSamples > 0) {
      const threshold = validSamples * 0.7;
      if (numberCount >= threshold) type = ColumnDataType.NUMBER;
      else if (dateCount >= threshold) type = ColumnDataType.DATE;
      else if (boolCount >= threshold) type = ColumnDataType.BOOLEAN;
    }

    return {
      name: header,
      type,
      sampleValues: sampleValues.slice(0, 5),
    };
  }

  private isNumber(value: string): boolean {
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    return !isNaN(Number(cleaned)) && cleaned.length > 0;
  }

  private isDate(value: string): boolean {
    // Pattern: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.
    const datePatterns = [
      /^\d{2}[\/\-]\d{2}[\/\-]\d{4}/,
      /^\d{4}[\/\-]\d{2}[\/\-]\d{2}/,
      /^\d{2}[\/\-]\d{2}[\/\-]\d{2}/,
    ];
    return datePatterns.some((p) => p.test(value));
  }

  private isBoolean(value: string): boolean {
    const lower = value.toLowerCase();
    return ['true', 'false', 'sim', 'não', 'nao', 'yes', 'no', '0', '1'].includes(lower);
  }
}
