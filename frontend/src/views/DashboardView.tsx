import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, FileSpreadsheet, Coffee, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancialData, DashboardState } from '@/hooks/useFinancialData';
import { useVendingMachineMetrics } from '@/hooks/useVendingMachineMetrics';
import { useAuthStore } from '@/store/authStore';
import { DateFilter } from '@/components/DateFilter';
import { TrendChart } from '@/components/charts/TrendChart';
import { CategoryChart } from '@/components/charts/CategoryChart';
import { MonthlyChart } from '@/components/charts/MonthlyChart';
import { SalesVolumeChart } from '@/components/charts/SalesVolumeChart';
import { ProductMixChart } from '@/components/charts/ProductMixChart';
import { AverageTicketChart } from '@/components/charts/AverageTicketChart';
import { HardwareHealthWidget } from '@/components/charts/HardwareHealthWidget';
import { EmptyPeriodBanner } from '@/components/EmptyPeriodBanner';
import { GraphType } from '@/services/financialService';
import { AppLayout } from '@/components/AppLayout';
import { dashboardService, Dashboard, DashboardWithData } from '@/services/dashboardService';
import { DynamicDashboardRenderer } from '@/components/dashboard/DynamicDashboardRenderer';
import { MetricCard } from '@/components/shared/MetricCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageSkeleton } from '@/components/shared/PageSkeleton';

/**
 * DashboardView - Componente Presentacional (Dumb Component)
 *
 * Responsabilidades:
 * - Renderizar KPIs financeiros e operacionais
 * - Exibir graficos em duas secoes: Financeira e Operacional
 * - Exibir feedback visual (loading, erro)
 * - LOTE 4: Usar dashboardState para NUNCA desaparecer quando filtro vazio
 *
 * TODA logica esta nos hooks useFinancialData e useVendingMachineMetrics (ViewModel).
 * Backend processa e agrega dados (frontend apenas exibe).
 */
export function DashboardView() {
  const navigate = useNavigate();
  const { user, currentCompanyId } = useAuthStore();

  // === Dynamic dashboard state ===
  const [dynamicDashboards, setDynamicDashboards] = useState<Dashboard[]>([]);
  const [dynamicLoading, setDynamicLoading] = useState(true);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardWithData | null>(null);
  const [selectedDashboardLoading, setSelectedDashboardLoading] = useState(false);
  const [showHardcoded, setShowHardcoded] = useState(false);

  const companyId = currentCompanyId || '';

  // Check for dynamic dashboards on mount / company change
  useEffect(() => {
    // Reset estado ao trocar de empresa para evitar dados stale
    setDynamicDashboards([]);
    setSelectedDashboard(null);
    setShowHardcoded(false);
    setDynamicLoading(true);

    if (!companyId) {
      setDynamicLoading(false);
      setShowHardcoded(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await dashboardService.list(companyId);
        if (cancelled) return;

        const dashboards = result.dashboards || [];
        setDynamicDashboards(dashboards);

        if (dashboards.length === 0) {
          setShowHardcoded(true);
        } else if (dashboards.length === 1) {
          // Auto-load the single dashboard
          setSelectedDashboardLoading(true);
          try {
            const full = await dashboardService.get(dashboards[0].id, companyId);
            if (!cancelled) setSelectedDashboard(full);
          } catch {
            if (!cancelled) setShowHardcoded(true);
          } finally {
            if (!cancelled) setSelectedDashboardLoading(false);
          }
        }
        // If multiple, we show the list (no auto-load)
      } catch {
        if (!cancelled) setShowHardcoded(true);
      } finally {
        if (!cancelled) setDynamicLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [companyId]);

  const handleSelectDashboard = useCallback(async (dashboard: Dashboard) => {
    setSelectedDashboardLoading(true);
    try {
      const full = await dashboardService.get(dashboard.id, companyId);
      setSelectedDashboard(full);
    } catch (err) {
      console.error('[DashboardView] Failed to load dashboard:', err);
    } finally {
      setSelectedDashboardLoading(false);
    }
  }, [companyId]);

  const handleRefreshDashboard = useCallback(async () => {
    if (!selectedDashboard) return;
    setSelectedDashboardLoading(true);
    try {
      const full = await dashboardService.get(selectedDashboard.id, companyId);
      setSelectedDashboard(full);
    } catch (err) {
      console.error('[DashboardView] Failed to refresh dashboard:', err);
    } finally {
      setSelectedDashboardLoading(false);
    }
  }, [selectedDashboard, companyId]);

  // Financial data hook
  const {
    summary,
    monthlyData,
    categoryData,
    trendData,
    metadata,
    dashboardState,
    isLoading,
    error,
    periodFilter,
    setPeriodFilter,
    fetchFinancialData,
    // NOVO (Lote 5): Funcoes para filtros individuais
    graphFilters,
    setGraphFilter,
    resetGraphFilter,
    getEffectiveFilter,
    fetchGraphData,
  } = useFinancialData();

  // Vending machine metrics hook
  const {
    salesByMachine,
    productMix,
    hardwareHealth,
    averageTicketTrend,
    summary: vendingSummary,
    isLoading: isLoadingVending,
    error: vendingError,
    fetchVendingMetrics,
  } = useVendingMachineMetrics();

  // Control which sections to show
  const [showOperationalGraphs, setShowOperationalGraphs] = useState(true);

  // Busca dados ao montar o componente ou quando periodFilter mudar
  useEffect(() => {
    console.log('[DashboardView] useEffect triggered:', {
      userId: user?.id,
      userName: user?.name,
      periodFilter
    });
    fetchFinancialData();

    // Fetch vending metrics (operational data)
    if (showOperationalGraphs) {
      fetchVendingMetrics();
    }
  }, [user?.id, companyId, periodFilter, showOperationalGraphs]);

  /**
   * NOVO (Lote 5): Handler para mudanca de filtro individual de grafico
   */
  const handleGraphFilterChange = async (graphType: GraphType, filter: any) => {
    setGraphFilter(graphType, filter);

    // Busca dados apenas para o grafico especifico
    await fetchGraphData(graphType, filter);
  };

  /**
   * NOVO (Lote 5): Handler para resetar filtro de grafico para o global
   */
  const handleResetGraphFilter = async (graphType: GraphType) => {
    resetGraphFilter(graphType);

    // Busca dados com filtro global
    await fetchGraphData(graphType, periodFilter);
  };

  // Formata valores em Real Brasileiro
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // === Dynamic dashboard rendering (takes priority over hardcoded) ===

  // Still checking if dynamic dashboards exist
  if (dynamicLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <PageSkeleton cards={3} charts={3} />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show selected dynamic dashboard
  if (selectedDashboard) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {dynamicDashboards.length > 1 && (
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
              onRefresh={handleRefreshDashboard}
              isLoading={selectedDashboardLoading}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show loading for a single dashboard being auto-loaded
  if (selectedDashboardLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <PageSkeleton cards={3} charts={3} />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show dashboard list if multiple exist and none selected
  if (dynamicDashboards.length > 1) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Dashboards
              </h1>
            </div>
            <div className="grid gap-4">
              {dynamicDashboards.map((db) => (
                <div
                  key={db.id}
                  className="glass-card-hover p-5 cursor-pointer"
                  onClick={() => handleSelectDashboard(db)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectDashboard(db);
                    }
                  }}
                >
                  <h3 className="text-lg font-semibold text-foreground">{db.name}</h3>
                  {db.description && (
                    <p className="text-sm text-muted-foreground mt-1">{db.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // === Fallback: Hardcoded dashboard (when no dynamic dashboards exist) ===

  // Estado de loading
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <PageSkeleton cards={3} charts={3} />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg text-center shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-600">
                Erro ao carregar dados
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => fetchFinancialData()}
                variant="outline"
                className="cursor-pointer"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // LOTE 4: Estado vazio - NUNCA FEZ UPLOAD (totalTransactionsInSystem === 0)
  if (dashboardState === DashboardState.NO_UPLOAD) {
    console.log('[DashboardView] NO_UPLOAD state:', {
      dashboardState,
      metadata,
      userId: user?.id,
      isLoading
    });
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <EmptyState
            icon={FileSpreadsheet}
            title="Dashboard"
            description="Sem dados para analise, importar arquivo primeiro. Suportamos arquivos Excel (.xlsx, .xls)."
            action={{
              label: "Importar arquivo",
              onClick: () => navigate('/upload'),
            }}
          />
        </div>
      </AppLayout>
    );
  }

  // Dashboard com dados
  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 animate-fade-in">
        {/* Greeting + Filtro de Periodo */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return 'Bom dia';
                  if (hour < 18) return 'Boa tarde';
                  return 'Boa noite';
                })()}, {user?.name?.split(' ')[0] || 'Usuário'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Visão geral dos seus dados financeiros
              </p>
            </div>
            <DateFilter
              periodFilter={periodFilter}
              onPeriodChange={setPeriodFilter}
            />
          </div>
        </div>

        {/* LOTE 4: Banner quando filtro retorna vazio (EMPTY_PERIOD) */}
        {dashboardState === DashboardState.EMPTY_PERIOD && metadata && (
          <div className="max-w-7xl mx-auto mb-6">
            <EmptyPeriodBanner
              earliestDate={metadata.earliestDate}
              latestDate={metadata.latestDate}
              onViewAllData={() => setPeriodFilter(undefined)}
            />
          </div>
        )}

        {/* KPIs - Sempre visivel quando tem dados no sistema */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value={formatCurrency(summary.totalRevenue)}
            icon={TrendingUp}
            trendDirection="up"
            subtitle="Total de entradas"
            delay={0}
          />

          <MetricCard
            title="Despesas Totais"
            value={formatCurrency(summary.totalExpense)}
            icon={TrendingDown}
            trendDirection="down"
            subtitle="Total de saidas"
            delay={100}
          />

          <MetricCard
            title={summary.profit >= 0 ? 'Lucro' : 'Prejuizo'}
            value={formatCurrency(summary.profit)}
            icon={DollarSign}
            trendDirection={summary.profit >= 0 ? 'up' : 'down'}
            subtitle="Receitas - Despesas"
            delay={200}
          />
        </div>

        {/* Graficos Financeiros - LOTE 5: Individualizados com filtros proprios */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Financeiro
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Grafico de Tendencia */}
            <TrendChart
              trendData={trendData}
              currentFilter={getEffectiveFilter(GraphType.TREND)}
              globalFilter={periodFilter}
              onFilterChange={handleGraphFilterChange}
              onResetFilter={handleResetGraphFilter}
            />

            {/* Grafico de Categorias */}
            <CategoryChart
              categoryData={categoryData}
              currentFilter={getEffectiveFilter(GraphType.CATEGORY)}
              globalFilter={periodFilter}
              onFilterChange={handleGraphFilterChange}
              onResetFilter={handleResetGraphFilter}
            />

            {/* Grafico Mensal */}
            <MonthlyChart
              monthlyData={monthlyData}
              currentFilter={getEffectiveFilter(GraphType.MONTHLY)}
              globalFilter={periodFilter}
              onFilterChange={handleGraphFilterChange}
              onResetFilter={handleResetGraphFilter}
            />
          </div>
        </div>

        {/* Graficos Operacionais - Maquinas de Vending */}
        {showOperationalGraphs && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Operacional
                </h2>
              </div>

              {/* Summary badges */}
              <div className="flex gap-3">
                <div className="px-3 py-1 bg-muted rounded-lg">
                  <span className="text-xs font-medium text-foreground">
                    {vendingSummary.totalMachines} Máquinas
                  </span>
                </div>
                <div className="px-3 py-1 bg-muted rounded-lg">
                  <span className="text-xs font-medium text-foreground">
                    {vendingSummary.totalSales} Vendas
                  </span>
                </div>
              </div>
            </div>

            {isLoadingVending ? (
              <PageSkeleton cards={0} charts={4} />
            ) : vendingError ? (
              <div className="p-4 bg-muted border border-border rounded-lg">
                <p className="text-foreground">{vendingError}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Os graficos operacionais estao temporariamente indisponiveis.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Sales Volume by Machine */}
                <SalesVolumeChart salesData={salesByMachine} />

                {/* Product Mix */}
                <ProductMixChart productMixData={productMix} />

                {/* Average Ticket Trend */}
                <AverageTicketChart ticketData={averageTicketTrend} />

                {/* Hardware Health */}
                <HardwareHealthWidget hardwareData={hardwareHealth} />
              </div>
            )}
          </div>
        )}

        {/* Informacoes adicionais */}
        <div className="max-w-7xl mx-auto mt-6 text-center text-sm text-muted-foreground">
          <p>
            Dados carregados com sucesso • {metadata?.totalTransactionsInSystem || 0} transacoes no sistema
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
