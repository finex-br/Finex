import { useState, useCallback } from 'react';
import {
  datasetService,
  DatasetSummary,
  UploadDatasetResponse,
  DatasetPreviewResponse,
  ColumnInfo,
} from '@/services/datasetService';
import { AxiosError } from 'axios';

export const useDatasetManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DatasetPreviewResponse | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadDatasetResponse | null>(null);

  const fetchDatasets = useCallback(async (companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await datasetService.list(companyId);
      setDatasets(response.datasets);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao buscar datasets');
      } else {
        setError('Erro desconhecido ao buscar datasets');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadDataset = useCallback(async (file: File, name: string, companyId: string) => {
    setIsLoading(true);
    setError(null);
    setUploadResult(null);
    try {
      const result = await datasetService.upload(file, name, companyId);
      setUploadResult(result);
      return result;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao fazer upload');
      } else {
        setError('Erro desconhecido ao fazer upload');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPreview = useCallback(async (
    datasetId: string,
    companyId: string,
    limit?: number,
    offset?: number,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await datasetService.getPreview(datasetId, companyId, limit, offset);
      setSelectedDataset(result);
      return result;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao buscar preview');
      } else {
        setError('Erro desconhecido ao buscar preview');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadDataset = useCallback(async (datasetId: string, companyId: string, fileName: string) => {
    try {
      const blob = await datasetService.download(datasetId, companyId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao baixar dataset');
      } else {
        setError('Erro desconhecido ao baixar dataset');
      }
    }
  }, []);

  const reuploadDataset = useCallback(async (datasetId: string, file: File, companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await datasetService.reupload(datasetId, file, companyId);
      setUploadResult(result);
      return result;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao re-enviar dataset');
      } else {
        setError('Erro desconhecido ao re-enviar dataset');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDataset = useCallback(async (datasetId: string, companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await datasetService.delete(datasetId, companyId);
      setDatasets((prev) => prev.filter((d) => d.id !== datasetId));
      if (selectedDataset?.id === datasetId) {
        setSelectedDataset(null);
      }
      return true;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao excluir dataset');
      } else {
        setError('Erro desconhecido ao excluir dataset');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedDataset]);

  const clearError = useCallback(() => setError(null), []);
  const clearUploadResult = useCallback(() => setUploadResult(null), []);

  return {
    datasets,
    selectedDataset,
    uploadResult,
    isLoading,
    error,
    fetchDatasets,
    uploadDataset,
    fetchPreview,
    downloadDataset,
    reuploadDataset,
    deleteDataset,
    clearError,
    clearUploadResult,
    setSelectedDataset,
  };
};
