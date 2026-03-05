import { useState } from 'react';
import { AxiosError } from 'axios';
import {
  pendingDocumentsService,
  PendingDocumentSummary,
  PendingDocumentStatus,
} from '@/services/pendingDocumentsService';
import { companyService } from '@/services/companyService';

export const usePendingDocumentsViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<PendingDocumentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});

  const fetchPendingDocuments = async (status?: PendingDocumentStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await pendingDocumentsService.list(status);
      setDocuments(response.documents);
      setTotal(response.total);

      // Fetch company names for unique companyIds
      const uniqueIds = [...new Set(
        response.documents
          .map((d) => d.companyId)
          .filter(Boolean) as string[]
      )];

      if (uniqueIds.length > 0) {
        const names: Record<string, string> = {};
        await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              names[id] = await companyService.getCompanyName(id);
            } catch {
              // keep ID as fallback
            }
          }),
        );
        setCompanyNames(names);
      }
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
    companyNames,
    fetchPendingDocuments,
  };
};
