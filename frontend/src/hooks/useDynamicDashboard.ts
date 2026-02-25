import { useState, useCallback } from 'react';
import { dashboardService, DashboardWithData } from '@/services/dashboardService';
import { AxiosError } from 'axios';

export const useDynamicDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardWithData | null>(null);

  const fetchDashboard = useCallback(async (dashboardId: string, companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.get(dashboardId, companyId);
      setDashboard(result);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Erro ao carregar dashboard');
      } else {
        setError('Erro desconhecido ao carregar dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    if (!dashboard) return;
    await fetchDashboard(dashboard.id, dashboard.companyId);
  }, [dashboard, fetchDashboard]);

  const clearError = useCallback(() => setError(null), []);

  return {
    dashboard,
    isLoading,
    error,
    fetchDashboard,
    refreshDashboard,
    clearError,
  };
};
