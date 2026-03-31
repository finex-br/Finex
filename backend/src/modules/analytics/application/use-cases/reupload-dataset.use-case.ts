import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDatasetRepository } from '../../domain/ports/dataset-repository.interface';
import { IDatasetRowsRepository } from '../../domain/ports/dataset-rows-repository.interface';
import { CsvParserAdapter } from '../../infrastructure/adapters/csv-parser.adapter';
import {
  ReuploadDatasetRequestDTO,
  UploadDatasetResponseDTO,
} from '../dtos/dataset.dto';
import { ColumnInfo, ColumnDataType } from '../../domain/value-objects/column-info';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReuploadDatasetUseCase
  implements IUseCase<ReuploadDatasetRequestDTO, UploadDatasetResponseDTO>
{
  constructor(
    @Inject('IDatasetRepository')
    private readonly datasetRepo: IDatasetRepository,
    @Inject('IDatasetRowsRepository')
    private readonly rowsRepo: IDatasetRowsRepository,
    private readonly csvParser: CsvParserAdapter,
  ) {}

  async execute(
    request: ReuploadDatasetRequestDTO,
  ): Promise<UploadDatasetResponseDTO> {
    const dataset = await this.datasetRepo.findById(request.datasetId);

    if (!dataset || dataset.companyId !== request.companyId) {
      throw new NotFoundException('Dataset not found');
    }

    console.log('[ReuploadDataset] Processing file:', request.fileName);

    const isCsv =
      request.mimeType === 'text/csv' ||
      request.fileName.toLowerCase().endsWith('.csv');

    let columns: ColumnInfo[];
    let rows: Record<string, any>[];
    let totalRows: number;

    if (isCsv) {
      const result = await this.csvParser.parse(request.fileBuffer);
      columns = result.columns;
      rows = result.rows;
      totalRows = result.totalRows;
    } else {
      const result = await this.parseExcel(request.fileBuffer);
      columns = result.columns;
      rows = result.rows;
      totalRows = result.totalRows;
    }

    console.log(`[ReuploadDataset] Parsed ${totalRows} rows, ${columns.length} columns`);

    // Delete old rows
    await this.rowsRepo.deleteByDatasetId(request.datasetId);

    // Insert new rows
    const datasetRows = rows.map((rowData, index) => ({
      datasetId: dataset.id.toString(),
      companyId: request.companyId,
      rowIndex: index,
      rowData,
    }));

    await this.rowsRepo.insertBatch(datasetRows);

    // Update dataset metadata
    dataset.updateColumns(columns, totalRows);
    await this.datasetRepo.update(dataset);

    console.log(`[ReuploadDataset] Dataset ${dataset.id.toString()} reuploaded successfully`);

    return {
      id: dataset.id.toString(),
      name: dataset.name,
      fileName: dataset.fileName,
      columns,
      sampleRows: rows.slice(0, 10),
      rowCount: totalRows,
    };
  }

  private async parseExcel(
    buffer: Buffer,
  ): Promise<{ columns: ColumnInfo[]; rows: Record<string, any>[]; totalRows: number }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    // Extract headers from first row
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[colNumber - 1] = String(cell.value ?? `Column_${colNumber}`).trim();
    });

    // Extract data rows
    const rows: Record<string, any>[] = [];
    for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);
      const rowData: Record<string, any> = {};
      let hasData = false;

      headers.forEach((header, idx) => {
        const cell = row.getCell(idx + 1);
        const value = cell.value;

        if (value !== null && value !== undefined) {
          hasData = true;
          if (value instanceof Date) {
            rowData[header] = value.toISOString();
          } else if (typeof value === 'object' && 'result' in value) {
            rowData[header] = String((value as any).result ?? '');
          } else {
            rowData[header] = String(value);
          }
        } else {
          rowData[header] = '';
        }
      });

      if (hasData) {
        rows.push(rowData);
      }
    }

    // Infer column types
    const columns = headers.map((header) => this.inferColumnType(header, rows));

    return { columns, rows, totalRows: rows.length };
  }

  private inferColumnType(
    header: string,
    rows: Record<string, any>[],
  ): ColumnInfo {
    const sampleSize = Math.min(rows.length, 20);
    const sampleValues: string[] = [];
    let numberCount = 0;
    let dateCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const value = rows[i][header];
      if (!value || value === '') continue;

      const strValue = String(value).trim();
      sampleValues.push(strValue);

      const cleaned = strValue.replace(/\./g, '').replace(',', '.');
      if (!isNaN(Number(cleaned)) && cleaned.length > 0) numberCount++;
      else if (/^\d{2,4}[\/\-]\d{2}[\/\-]\d{2,4}/.test(strValue)) dateCount++;
    }

    const validSamples = sampleValues.length;
    let type = ColumnDataType.STRING;

    if (validSamples > 0) {
      const threshold = validSamples * 0.7;
      if (numberCount >= threshold) type = ColumnDataType.NUMBER;
      else if (dateCount >= threshold) type = ColumnDataType.DATE;
    }

    return { name: header, type, sampleValues: sampleValues.slice(0, 5) };
  }
}
