import { useState, useCallback } from 'react';
import { dashboardService, Dashboard } from '@/services/dashboardService';
import { chartService, ChartConfig } from '@/services/chartService';
import { AxiosError } from 'axios';

export const useDashboardConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]);

  const fetchDashboards = useCallback(async (companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dashboardService.list(companyId);
      setDashboards(response.dashboards);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao buscar dashboards');
      } else {
        setError('Erro desconhecido ao buscar dashboards');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDashboard = useCallback(async (
    companyId: string,
    name: string,
    description?: string,
    isDefault?: boolean,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.create({
        companyId,
        name,
        description,
        isDefault,
      });
      setDashboards((prev) => [result.dashboard, ...prev]);
      return result.dashboard;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao criar dashboard');
      } else {
        setError('Erro desconhecido ao criar dashboard');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDashboard = useCallback(async (
    id: string,
    companyId: string,
    data: { name?: string; description?: string; isDefault?: boolean; embedHtml?: string },
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.update(id, { companyId, ...data });
      setDashboards((prev) =>
        prev.map((d) => (d.id === id ? result.dashboard : d)),
      );
      if (selectedDashboard?.id === id) {
        setSelectedDashboard(result.dashboard);
      }
      return result.dashboard;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao atualizar dashboard');
      } else {
        setError('Erro desconhecido ao atualizar dashboard');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedDashboard]);

  const deleteDashboard = useCallback(async (id: string, companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await dashboardService.delete(id, companyId);
      setDashboards((prev) => prev.filter((d) => d.id !== id));
      if (selectedDashboard?.id === id) {
        setSelectedDashboard(null);
        setCharts([]);
      }
      return true;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao excluir dashboard');
      } else {
        setError('Erro desconhecido ao excluir dashboard');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedDashboard]);

  const fetchDashboardWithCharts = useCallback(async (id: string, companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.get(id, companyId);
      setSelectedDashboard({
        id: result.id,
        companyId: result.companyId,
        name: result.name,
        description: result.description,
        isDefault: result.isDefault,
        embedHtml: result.embedHtml,
        createdBy: '',
        createdAt: '',
        updatedAt: '',
      });
      setCharts(result.charts.map((c) => c.config));
      return result;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao buscar dashboard');
      } else {
        setError('Erro desconhecido ao buscar dashboard');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteChart = useCallback(async (chartId: string, companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await chartService.delete(chartId, companyId);
      setCharts((prev) => prev.filter((c) => c.id !== chartId));
      return true;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao excluir gráfico');
      } else {
        setError('Erro desconhecido ao excluir gráfico');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    dashboards,
    selectedDashboard,
    charts,
    isLoading,
    error,
    fetchDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    fetchDashboardWithCharts,
    deleteChart,
    setSelectedDashboard,
    clearError,
  };
};
