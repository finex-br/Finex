import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/AppLayout';
import { dashboardService, Dashboard, DashboardWithData } from '@/services/dashboardService';
import { DynamicDashboardRenderer } from '@/components/dashboard/DynamicDashboardRenderer';
import { DashboardSelector } from '@/components/dashboard/DashboardSelector';
import { DashboardSelectorSkeleton } from '@/components/dashboard/DashboardSelectorSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

/**
 * DashboardView — Orchestrates dynamic dashboard selection and display.
 *
 * Flow:
 *  1. Loading        → skeleton grid
 *  2. No dashboards  → empty state
 *  3. One dashboard  → auto-load and render
 *  4. Multiple       → visual card grid (DashboardSelector)
 *  5. Selected       → back button + DynamicDashboardRenderer
 */
export function DashboardView() {
  const { currentCompanyId } = useAuthStore();

  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardWithData | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const companyId = currentCompanyId || '';

  // Fetch dashboard list on mount / company change
  useEffect(() => {
    setDashboards([]);
    setSelectedDashboard(null);
    setLoading(true);

    if (!companyId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const result = await dashboardService.list(companyId);
        if (cancelled) return;

        const list = result.dashboards || [];
        setDashboards(list);

        // Auto-load when exactly one dashboard exists
        if (list.length === 1) {
          setSelectedLoading(true);
          try {
            const full = await dashboardService.get(list[0].id, companyId);
            if (!cancelled) setSelectedDashboard(full);
          } finally {
            if (!cancelled) setSelectedLoading(false);
          }
        }
      } catch {
        // List failed — dashboards stays empty, shows empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [companyId]);

  const handleSelect = useCallback(async (dashboard: Dashboard) => {
    setSelectedLoading(true);
    try {
      const full = await dashboardService.get(dashboard.id, companyId);
      setSelectedDashboard(full);
    } catch (err) {
      console.error('[DashboardView] Failed to load dashboard:', err);
    } finally {
      setSelectedLoading(false);
    }
  }, [companyId]);

  const handleRefresh = useCallback(async () => {
    if (!selectedDashboard) return;
    setSelectedLoading(true);
    try {
      const full = await dashboardService.get(selectedDashboard.id, companyId);
      setSelectedDashboard(full);
    } catch (err) {
      console.error('[DashboardView] Failed to refresh dashboard:', err);
    } finally {
      setSelectedLoading(false);
    }
  }, [selectedDashboard, companyId]);

  // --- Render states ---

  // 1. Loading
  if (loading || (selectedLoading && !selectedDashboard)) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <DashboardSelectorSkeleton />
          </div>
        </div>
      </AppLayout>
    );
  }

  // 2. Selected dashboard — render it
  if (selectedDashboard) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {dashboards.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 cursor-pointer"
                onClick={() => setSelectedDashboard(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <DynamicDashboardRenderer
              dashboard={selectedDashboard}
              companyId={companyId}
              onRefresh={handleRefresh}
              isLoading={selectedLoading}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  // 3. No dashboards — empty state
  if (dashboards.length === 0) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <EmptyState
            icon={LayoutDashboard}
            title="Nenhum dashboard configurado"
            description="Entre em contato com o administrador para configurar dashboards para sua empresa."
          />
        </div>
      </AppLayout>
    );
  }

  // 4. Multiple dashboards — visual card grid
  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <DashboardSelector
          dashboards={dashboards}
          onSelect={handleSelect}
          isLoading={false}
        />
      </div>
    </AppLayout>
  );
}
