/**
 * DTOs para Upload Raw Document Flow
 */

// ===== Upload Raw Document =====

export interface UploadRawDocumentRequestDTO {
  companyId: string;
  userId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface UploadRawDocumentResponseDTO {
  success: boolean;
  documentId: string;
  message: string;
  preview?: {
    headers: string[];
    sampleRows: any[][];
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

// ===== Map Document Columns =====

export interface MapDocumentColumnsRequestDTO {
  documentId: string;
  userId: string;
  columnMapping: {
    date: string;
    description?: string;
    category?: string;
    amount: string;
    type?: string;
  };
}

export interface MapDocumentColumnsResponseDTO {
  success: boolean;
  message: string;
  documentId: string;
}

// ===== Validate Document =====

export interface ValidateDocumentRequestDTO {
  documentId: string;
  userId: string;
}

export interface ValidateDocumentResponseDTO {
  success: boolean;
  documentId: string;
  isValid: boolean;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
  validTransactions: number;
  invalidTransactions: number;
  message: string;
}

// ===== Approve Document =====

export interface ApproveDocumentRequestDTO {
  documentId: string;
  userId: string;
}

export interface ApproveDocumentResponseDTO {
  success: boolean;
  message: string;
  documentId: string;
  transactionsImported: number;
}

// ===== Reject Document =====

export interface RejectDocumentRequestDTO {
  documentId: string;
  userId: string;
  notes?: string;
}

export interface RejectDocumentResponseDTO {
  success: boolean;
  message: string;
  documentId: string;
}

// ===== Get Pending Documents =====

export interface GetPendingDocumentsRequestDTO {
  companyId: string;
  status?: 'UPLOADED' | 'MAPPED' | 'VALIDATED' | 'APPROVED' | 'REJECTED';
}

export interface PendingDocumentSummaryDTO {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  totalRows: number;
  hasMapping: boolean;
  hasValidation: boolean;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: string;
}

export interface GetPendingDocumentsResponseDTO {
  success: boolean;
  documents: PendingDocumentSummaryDTO[];
  total: number;
}

// ===== Get Document Details =====

export interface GetDocumentDetailsRequestDTO {
  documentId: string;
  userId: string;
}

export interface GetDocumentDetailsResponseDTO {
  success: boolean;
  document: {
    id: string;
    fileName: string;
    fileSize: number;
    status: string;
    headers: string[];
    sampleRows: any[][];
    totalRows: number;
    columnMapping?: {
      date?: string;
      description?: string;
      category?: string;
      amount?: string;
      type?: string;
    };
    validationResult?: {
      isValid: boolean;
      errors: Array<{ row: number; field: string; message: string }>;
      warnings: Array<{ row: number; field: string; message: string }>;
      validTransactions: number;
      invalidTransactions: number;
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
