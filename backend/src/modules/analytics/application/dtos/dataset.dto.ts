import { ColumnInfo } from '../../domain/value-objects/column-info';

// ===== Upload Dataset =====

export interface UploadDatasetRequestDTO {
  companyId: string;
  userId: string;
  name: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface UploadDatasetResponseDTO {
  id: string;
  name: string;
  fileName: string;
  columns: ColumnInfo[];
  sampleRows: Record<string, any>[];
  rowCount: number;
}

// ===== Get Datasets =====

export interface GetDatasetsRequestDTO {
  companyId: string;
}

export interface DatasetSummaryDTO {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  columns: ColumnInfo[];
  rowCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Get Dataset Preview =====

export interface GetDatasetPreviewRequestDTO {
  datasetId: string;
  companyId: string;
  limit?: number;
  offset?: number;
}

export interface GetDatasetPreviewResponseDTO {
  id: string;
  name: string;
  columns: ColumnInfo[];
  rows: Record<string, any>[];
  totalRows: number;
}

// ===== Reupload Dataset =====

export interface ReuploadDatasetRequestDTO {
  datasetId: string;
  companyId: string;
  userId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

// ===== Execute Query =====

export interface ExecuteQueryRequestDTO {
  companyId: string;
  datasetId: string;
  select: {
    column: string;
    aggregate?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
    alias?: string;
  }[];
  where?: {
    column: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
    value: any;
  }[];
  groupBy?: string[];
  orderBy?: { column: string; direction: 'ASC' | 'DESC' }[];
  limit?: number;
}

export interface ExecuteQueryResponseDTO {
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

// ===== Download Dataset =====

export interface DownloadDatasetRequestDTO {
  datasetId: string;
  companyId: string;
}

export interface DownloadDatasetResponseDTO {
  fileName: string;
  columns: string[];
  rows: Record<string, any>[];
}
