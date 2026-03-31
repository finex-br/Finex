import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { DynamicDashboardRenderer } from '@/components/dashboard/DynamicDashboardRenderer';
import { useDynamicDashboard } from '@/hooks/useDynamicDashboard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
} from 'lucide-react';

export function DynamicDashboardView() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const [searchParams] = useSearchParams();

  const companyIdFromUrl = searchParams.get('companyId');
  const companyId =
    companyIdFromUrl || localStorage.getItem('current_company_id') || '';

  const {
    dashboard,
    isLoading,
    error,
    fetchDashboard,
    refreshDashboard,
    clearError,
  } = useDynamicDashboard();

  // Load dashboard on mount
  useEffect(() => {
    if (dashboardId && companyId) {
      fetchDashboard(dashboardId, companyId);
    }
  }, [dashboardId, companyId, fetchDashboard]);

  // Loading state
  if (isLoading && !dashboard) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Carregando dashboard...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Fechar
                </Button>
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  if (dashboardId && companyId) {
                    clearError();
                    fetchDashboard(dashboardId, companyId);
                  }
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Empty state
  if (!dashboard) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <LayoutDashboard className="h-12 w-12" />
            <p className="text-sm">Dashboard nao encontrado</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <DynamicDashboardRenderer
            dashboard={dashboard}
            companyId={companyId}
            onRefresh={refreshDashboard}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
