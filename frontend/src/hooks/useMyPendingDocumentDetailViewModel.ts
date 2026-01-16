import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import {
  pendingDocumentsService,
  DocumentDetails,
  ValidateDocumentResponse,
} from '@/services/pendingDocumentsService';

export const useMyPendingDocumentDetailViewModel = (documentId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<DocumentDetails | null>(null);

  const [validation, setValidation] = useState<ValidateDocumentResponse | null>(null);

  const headers = useMemo(() => document?.rawData.headers || [], [document]);
  const previewRows = useMemo(() => document?.rawData.sampleRows || [], [document]);

  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await pendingDocumentsService.getDetails(documentId);
      setDocument(response.document);

      if (response.document.validationResult) {
        setValidation({
          success: true,
          documentId: response.document.id,
          isValid: response.document.validationResult.isValid,
          errors: response.document.validationResult.errors,
          warnings: response.document.validationResult.warnings,
          validTransactions: response.document.validationResult.validTransactions,
          invalidTransactions: response.document.validationResult.invalidTransactions,
          message: response.document.validationResult.message || '',
        });
      } else {
        setValidation(null);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao buscar documento');
      setDocument(null);
      setValidation(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!documentId) return;
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  return {
    isLoading,
    error,
    document,
    headers,
    previewRows,
    validation,
    refetch: fetchDetails,
  };
};
