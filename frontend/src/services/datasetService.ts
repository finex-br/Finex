import { api } from './api';

// ===== Types =====

export interface ColumnInfo {
  name: string;
  type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN';
  sampleValues?: string[];
}

export interface DatasetSummary {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  columns: ColumnInfo[];
  rowCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDatasetResponse {
  success: boolean;
  id: string;
  name: string;
  fileName: string;
  columns: ColumnInfo[];
  sampleRows: Record<string, any>[];
  rowCount: number;
}

export interface DatasetPreviewResponse {
  success: boolean;
  id: string;
  name: string;
  columns: ColumnInfo[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface ExecuteQueryRequest {
  datasetId: string;
  companyId?: string;
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

export interface ExecuteQueryResponse {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

// ===== Service =====

export const datasetService = {
  upload: async (file: File, name: string, companyId: string): Promise<UploadDatasetResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('companyId', companyId);

    const response = await api.post<UploadDatasetResponse>('/analytics/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  list: async (companyId: string): Promise<{ success: boolean; datasets: DatasetSummary[] }> => {
    const response = await api.get('/analytics/datasets', {
      params: { companyId },
    });
    return response.data;
  },

  getPreview: async (
    id: string,
    companyId: string,
    limit?: number,
    offset?: number,
  ): Promise<DatasetPreviewResponse> => {
    const params: Record<string, string> = { companyId };
    if (limit !== undefined) params.limit = String(limit);
    if (offset !== undefined) params.offset = String(offset);

    const response = await api.get<DatasetPreviewResponse>(`/analytics/datasets/${id}`, {
      params,
    });
    return response.data;
  },

  download: async (id: string, companyId: string): Promise<Blob> => {
    const response = await api.get(`/analytics/datasets/${id}/download`, {
      params: { companyId },
      responseType: 'blob',
    });
    return response.data;
  },

  reupload: async (id: string, file: File, companyId: string): Promise<UploadDatasetResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', companyId);

    const response = await api.put<UploadDatasetResponse>(
      `/analytics/datasets/${id}/reupload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  delete: async (id: string, companyId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/analytics/datasets/${id}`, {
      params: { companyId },
    });
    return response.data;
  },

  executeQuery: async (query: ExecuteQueryRequest): Promise<ExecuteQueryResponse> => {
    const response = await api.post<ExecuteQueryResponse>('/analytics/datasets/query', query);
    return response.data;
  },
};
