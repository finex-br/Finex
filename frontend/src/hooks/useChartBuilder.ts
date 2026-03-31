import { useState, useCallback } from 'react';
import {
  chartService,
  ChartConfig,
  ChartType,
  DataSourceConfig,
  VisualConfig,
  GridPosition,
} from '@/services/chartService';
import { datasetService, ColumnInfo, ExecuteQueryResponse } from '@/services/datasetService';
import { AxiosError } from 'axios';

interface ChartBuilderState {
  name: string;
  chartType: ChartType;
  datasetId: string;
  dataSource: DataSourceConfig;
  visualConfig: VisualConfig;
  position: GridPosition;
}

const defaultState: ChartBuilderState = {
  name: '',
  chartType: 'BAR',
  datasetId: '',
  dataSource: {
    mode: 'DYNAMIC',
    datasetIds: [],
  },
  visualConfig: {
    legend: true,
  },
  position: { x: 0, y: 0, width: 6, height: 4 },
};

export const useChartBuilder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ChartBuilderState>(defaultState);
  const [availableColumns, setAvailableColumns] = useState<ColumnInfo[]>([]);
  const [previewData, setPreviewData] = useState<ExecuteQueryResponse | null>(null);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);

  const setName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }));
  }, []);

  const setChartType = useCallback((chartType: ChartType) => {
    setState((prev) => ({ ...prev, chartType }));
  }, []);

  const setDatasetId = useCallback((datasetId: string) => {
    setState((prev) => ({
      ...prev,
      datasetId,
      dataSource: { ...prev.dataSource, datasetIds: [datasetId] },
    }));
  }, []);

  const setVisualConfig = useCallback((visualConfig: Partial<VisualConfig>) => {
    setState((prev) => ({
      ...prev,
      visualConfig: { ...prev.visualConfig, ...visualConfig },
    }));
  }, []);

  const setPosition = useCallback((position: Partial<GridPosition>) => {
    setState((prev) => ({
      ...prev,
      position: { ...prev.position, ...position },
    }));
  }, []);

  const setQuery = useCallback((query: DataSourceConfig['query']) => {
    setState((prev) => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        query: query ? { ...query, datasetId: prev.datasetId } : query,
      },
    }));
  }, []);

  const loadDatasetColumns = useCallback(async (datasetId: string, companyId: string) => {
    try {
      const preview = await datasetService.getPreview(datasetId, companyId, 0);
      setAvailableColumns(preview.columns);
    } catch (err) {
      console.error('[useChartBuilder] Failed to load columns:', err);
    }
  }, []);

  const fetchPreview = useCallback(async (companyId: string) => {
    if (!state.datasetId || !state.dataSource.query?.select?.length) {
      setPreviewData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await datasetService.executeQuery({
        datasetId: state.datasetId,
        companyId,
        ...state.dataSource.query,
        limit: state.dataSource.query.limit || 100,
      });
      setPreviewData(result);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao executar preview');
      } else {
        setError('Erro desconhecido ao executar preview');
      }
    } finally {
      setIsLoading(false);
    }
  }, [state.datasetId, state.dataSource.query]);

  const saveChart = useCallback(async (dashboardId: string, companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (editingChartId) {
        const result = await chartService.update(editingChartId, {
          companyId,
          name: state.name,
          chartType: state.chartType,
          dataSource: state.dataSource,
          visualConfig: state.visualConfig,
          position: state.position,
        });
        return result.chart;
      } else {
        const result = await chartService.create({
          dashboardId,
          companyId,
          name: state.name,
          chartType: state.chartType,
          dataSource: state.dataSource,
          visualConfig: state.visualConfig,
          position: state.position,
        });
        return result.chart;
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao salvar gráfico');
      } else {
        setError('Erro desconhecido ao salvar gráfico');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [editingChartId, state]);

  const loadChartForEditing = useCallback(async (chartId: string, companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await chartService.get(chartId, companyId);
      const chart = result.chart;
      setEditingChartId(chartId);
      setState({
        name: chart.name,
        chartType: chart.chartType,
        datasetId: chart.dataSource.datasetIds[0] || '',
        dataSource: chart.dataSource,
        visualConfig: chart.visualConfig,
        position: chart.position,
      });
      if (chart.dataSource.datasetIds[0]) {
        await loadDatasetColumns(chart.dataSource.datasetIds[0], companyId);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao carregar gráfico');
      } else {
        setError('Erro desconhecido ao carregar gráfico');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadDatasetColumns]);

  const resetBuilder = useCallback(() => {
    setState(defaultState);
    setAvailableColumns([]);
    setPreviewData(null);
    setEditingChartId(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    ...state,
    availableColumns,
    previewData,
    editingChartId,
    isLoading,
    error,
    setName,
    setChartType,
    setDatasetId,
    setVisualConfig,
    setPosition,
    setQuery,
    loadDatasetColumns,
    fetchPreview,
    saveChart,
    loadChartForEditing,
    resetBuilder,
    clearError,
  };
};
