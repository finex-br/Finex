import { api } from '@/services/api';

export type PendingDocumentStatus =
  | 'UPLOADED'
  | 'MAPPED'
  | 'VALIDATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ERROR'
  | 'PROCESSING'
  | 'DONE';

export interface PendingDocumentSummary {
  id: string;
  companyId?: string;
  fileName: string;
  fileSize: number;
  status: string;
  totalRows: number;
  hasMapping: boolean;
  hasValidation: boolean;
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
}

export interface GetPendingDocumentsResponse {
  success: boolean;
  documents: PendingDocumentSummary[];
  total: number;
}

export interface DocumentDetails {
  id: string;
  companyId?: string;
  fileName: string;
  fileSize: number;
  status: string;
  uploadedBy: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  rawData: {
    headers: string[];
    sampleRows: unknown[][];
    totalRows: number;
  };
  columnMapping: {
    date?: string;
    description?: string;
    category?: string;
    amount?: string;
    type?: string;
    excludedRows?: number[];
    audit?: Array<{
      at: string;
      userId: string;
      action: string;
      details?: unknown;
    }>;
    overrides?: Record<
      string,
      {
        date?: unknown;
        amount?: unknown;
        description?: unknown;
        category?: unknown;
        type?: unknown;
      }
    >;
  } | null;
  validationResult:
    | {
        isValid: boolean;
        errors: Array<{
          row: number;
          field: string;
          message: string;
          rowIndex?: number;
          rowValues?: unknown[] | null;
          rowData?: Record<string, unknown> | null;
        }>;
        warnings: Array<{
          row: number;
          field: string;
          message: string;
          rowIndex?: number;
          rowValues?: unknown[] | null;
          rowData?: Record<string, unknown> | null;
        }>;
        validTransactions: number;
        invalidTransactions: number;
        message?: string;
      }
    | null;
}

export interface GetDocumentDetailsResponse {
  success: boolean;
  document: DocumentDetails;
}

export interface UploadRawDocumentResponse {
  success: boolean;
  documentId: string;
  message: string;
  preview?: {
    headers: string[];
    sampleRows: unknown[][];
    totalRows: number;
  };
  suggestedMapping?: {
    date?: string;
    description?: string;
    category?: string;
    amount?: string;
    type?: string;
  };
}

export interface ColumnMappingInput {
  date: string;
  amount: string;
  description?: string;
  category?: string;
  type?: string;
}

export interface MapDocumentColumnsResponse {
  success: boolean;
  message: string;
  documentId: string;
}

export interface ValidateDocumentResponse {
  success: boolean;
  documentId: string;
  isValid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    rowIndex?: number;
    rowValues?: unknown[] | null;
    rowData?: Record<string, unknown> | null;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
    rowIndex?: number;
    rowValues?: unknown[] | null;
    rowData?: Record<string, unknown> | null;
  }>;
  validTransactions: number;
  invalidTransactions: number;
  message: string;
}

export interface ApproveDocumentResponse {
  success: boolean;
  message: string;
  documentId: string;
  transactionsImported: number;
}

export interface RejectDocumentResponse {
  success: boolean;
  message: string;
  documentId: string;
  status?: string;
}

export interface SaveRowOverridesResponse {
  success: boolean;
  message: string;
  documentId: string;
}

export interface ExcludeRowsResponse {
  success: boolean;
  message: string;
  documentId: string;
  excludedRows: number[];
}

const basePath = '/financial/pending-documents';

export const pendingDocumentsService = {
  list: async (status?: PendingDocumentStatus): Promise<GetPendingDocumentsResponse> => {
    const params: Record<string, string> = {};
    if (status) params.status = status;

    const response = await api.get<GetPendingDocumentsResponse>(basePath, { params });
    return response.data;
  },

  getDetails: async (documentId: string): Promise<GetDocumentDetailsResponse> => {
    const response = await api.get<GetDocumentDetailsResponse>(`${basePath}/${documentId}`);
    return response.data;
  },

  upload: async (file: File): Promise<UploadRawDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadRawDocumentResponse>(`${basePath}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  mapColumns: async (documentId: string, columnMapping: ColumnMappingInput): Promise<MapDocumentColumnsResponse> => {
    const response = await api.post<MapDocumentColumnsResponse>(
      `${basePath}/${documentId}/map`,
      { columnMapping },
    );
    return response.data;
  },

  validate: async (documentId: string): Promise<ValidateDocumentResponse> => {
    const response = await api.post<ValidateDocumentResponse>(`${basePath}/${documentId}/validate`);
    return response.data;
  },

  approve: async (documentId: string): Promise<ApproveDocumentResponse> => {
    const response = await api.post<ApproveDocumentResponse>(`${basePath}/${documentId}/approve`);
    return response.data;
  },

  reject: async (documentId: string, notes?: string): Promise<RejectDocumentResponse> => {
    const response = await api.post<RejectDocumentResponse>(`${basePath}/${documentId}/reject`, {
      notes,
    });
    return response.data;
  },

  saveRowOverrides: async (
    documentId: string,
    overrides: Record<string, any>,
  ): Promise<SaveRowOverridesResponse> => {
    const response = await api.post<SaveRowOverridesResponse>(
      `${basePath}/${documentId}/overrides`,
      { overrides },
    );
    return response.data;
  },

  excludeRows: async (documentId: string, rows: number[]): Promise<ExcludeRowsResponse> => {
    const response = await api.post<ExcludeRowsResponse>(`${basePath}/${documentId}/exclusions`, {
      rows,
    });
    return response.data;
  },
};
