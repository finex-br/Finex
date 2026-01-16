import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import {
  pendingDocumentsService,
  ColumnMappingInput,
  DocumentDetails,
  ValidateDocumentResponse,
} from '@/services/pendingDocumentsService';
import { useAuthStore } from '@/store/authStore';

export const usePendingDocumentDetailViewModel = (documentId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<DocumentDetails | null>(null);

  const isSystemAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

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

  const [rowOverrides, setRowOverrides] = useState<Record<string, { date?: string; amount?: string }>>({});
  const [isSavingOverrides, setIsSavingOverrides] = useState(false);

  const [excludedRows, setExcludedRows] = useState<number[]>([]);
  const [isExcludingRows, setIsExcludingRows] = useState(false);

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

        const overrides = (existing as any).overrides as Record<string, any> | undefined;
        if (overrides) {
          const normalized: Record<string, { date?: string; amount?: string }> = {};
          Object.entries(overrides).forEach(([row, values]) => {
            normalized[row] = {
              date: values?.date !== undefined ? String(values.date) : undefined,
              amount: values?.amount !== undefined ? String(values.amount) : undefined,
            };
          });
          setRowOverrides((prev) => ({ ...normalized, ...prev }));
        }

        const excluded = (existing as any).excludedRows as number[] | undefined;
        if (Array.isArray(excluded)) {
          setExcludedRows(excluded);
        }
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

  const excludeRow = async (rowNumber: number) => {
    setIsExcludingRows(true);
    setError(null);
    setActionMessage(null);

    try {
      const result = await pendingDocumentsService.excludeRows(documentId, [rowNumber]);
      if (!result.success) {
        setError(result.message || 'Falha ao excluir linha');
        return;
      }
      setExcludedRows(result.excludedRows);
      setActionMessage(result.message);
      await fetchDetails();
      await validate();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao excluir linha');
    } finally {
      setIsExcludingRows(false);
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

  const saveOverrides = async () => {
    setIsSavingOverrides(true);
    setError(null);
    setActionMessage(null);

    try {
      const result = await pendingDocumentsService.saveRowOverrides(documentId, rowOverrides);
      if (!result.success) {
        setError(result.message || 'Falha ao salvar correções');
        return;
      }

      setActionMessage(result.message);
      await fetchDetails();
      await validate();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao salvar correções');
    } finally {
      setIsSavingOverrides(false);
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

    isSystemAdmin,

    headers,

    mapping,
    setMapping,
    isSavingMapping,
    saveMapping,

    validation,
    isValidating,
    validate,

    rowOverrides,
    setRowOverrides,
    isSavingOverrides,
    saveOverrides,

    excludedRows,
    isExcludingRows,
    excludeRow,

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
