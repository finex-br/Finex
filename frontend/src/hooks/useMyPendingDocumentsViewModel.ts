import { useState } from 'react';
import { AxiosError } from 'axios';
import {
  pendingDocumentsService,
  PendingDocumentSummary,
  PendingDocumentStatus,
} from '@/services/pendingDocumentsService';

export const useMyPendingDocumentsViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<PendingDocumentSummary[]>([]);
  const [total, setTotal] = useState(0);

  const fetchMyDocuments = async (status?: PendingDocumentStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await pendingDocumentsService.list(status);
      setDocuments(response.documents);
      setTotal(response.total);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao listar documentos');
      setDocuments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    documents,
    total,
    fetchMyDocuments,
  };
};
