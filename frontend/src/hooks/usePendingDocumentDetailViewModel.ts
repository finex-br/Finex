import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import {
  pendingDocumentsService,
  ColumnMappingInput,
  DocumentDetails,
  ValidateDocumentResponse,
} from '@/services/pendingDocumentsService';

export const usePendingDocumentDetailViewModel = (documentId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<DocumentDetails | null>(null);

  const [isSavingMapping, setIsSavingMapping] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const [mapping, setMapping] = useState<ColumnMappingInput>({
    date: '',
    amount: '',
    description: undefined,
    category: undefined,
    type: undefined,
  });

  const [validation, setValidation] = useState<ValidateDocumentResponse | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const headers = useMemo(() => document?.rawData.headers || [], [document]);

  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await pendingDocumentsService.getDetails(documentId);
      setDocument(response.document);

      const existing = response.document.columnMapping;
      if (existing) {
        setMapping({
          date: existing.date || '',
          amount: existing.amount || '',
          description: existing.description || undefined,
          category: existing.category || undefined,
          type: existing.type || undefined,
        });
      }

      if (response.document.validationResult) {
        setValidation({
          success: true,
          documentId: response.document.id,
          isValid: response.document.validationResult.isValid,
          errors: response.document.validationResult.errors,
          warnings: response.document.validationResult.warnings,
          validTransactions: response.document.validationResult.validTransactions,
          invalidTransactions: response.document.validationResult.invalidTransactions,
          message: '',
        });
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao buscar documento');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!documentId) return;
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const saveMapping = async () => {
    setIsSavingMapping(true);
    setError(null);
    setActionMessage(null);

    try {
      if (!mapping.date || !mapping.amount) {
        setError('Mapeamento requer pelo menos Data e Valor');
        return;
      }

      const result = await pendingDocumentsService.mapColumns(documentId, mapping);
      if (!result.success) {
        setError(result.message || 'Falha ao salvar mapeamento');
        return;
      }

      setActionMessage(result.message || 'Mapeamento salvo');
      await fetchDetails();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao salvar mapeamento');
    } finally {
      setIsSavingMapping(false);
    }
  };

  const validate = async () => {
    setIsValidating(true);
    setError(null);
    setActionMessage(null);

    try {
      const result = await pendingDocumentsService.validate(documentId);
      setValidation(result);
      setActionMessage(result.message);
      await fetchDetails();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao validar documento');
    } finally {
      setIsValidating(false);
    }
  };

  const approve = async () => {
    setIsApproving(true);
    setError(null);
    setActionMessage(null);

    try {
      const result = await pendingDocumentsService.approve(documentId);
      setActionMessage(result.message);
      await fetchDetails();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao aprovar documento');
    } finally {
      setIsApproving(false);
    }
  };

  const reject = async () => {
    setIsRejecting(true);
    setError(null);
    setActionMessage(null);

    try {
      const result = await pendingDocumentsService.reject(documentId, rejectNotes || undefined);
      setActionMessage(result.message);
      await fetchDetails();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao rejeitar documento');
    } finally {
      setIsRejecting(false);
    }
  };

  return {
    isLoading,
    error,
    document,

    headers,

    mapping,
    setMapping,
    isSavingMapping,
    saveMapping,

    validation,
    isValidating,
    validate,

    isApproving,
    approve,

    rejectNotes,
    setRejectNotes,
    isRejecting,
    reject,

    actionMessage,
    refetch: fetchDetails,
  };
};
