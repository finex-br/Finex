import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, FileSpreadsheet, Coffee, Activity, ArrowLeft, LayoutDashboard } from 'lucide-react';
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

/**
 * DashboardView - Componente Presentacional (Dumb Component)
 * 
 * Responsabilidades:
 * - Renderizar KPIs financeiros e operacionais
 * - Exibir gráficos em duas seções: Financeira e Operacional
 * - Exibir feedback visual (loading, erro)
 * - LOTE 4: Usar dashboardState para NUNCA desaparecer quando filtro vazio
 * 
 * TODA lógica está nos hooks useFinancialData e useVendingMachineMetrics (ViewModel).
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
    // NOVO (Lote 5): Funções para filtros individuais
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
   * NOVO (Lote 5): Handler para mudança de filtro individual de gráfico
   */
  const handleGraphFilterChange = async (graphType: GraphType, filter: any) => {
    setGraphFilter(graphType, filter);
    
    // Busca dados apenas para o gráfico específico
    await fetchGraphData(graphType, filter);
  };

  /**
   * NOVO (Lote 5): Handler para resetar filtro de gráfico para o global
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">Carregando dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  // Show selected dynamic dashboard
  if (selectedDashboard) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {dynamicDashboards.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="mb-4"
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">Carregando dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  // Show dashboard list if multiple exist and none selected
  if (dynamicDashboards.length > 1) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <LayoutDashboard className="h-6 w-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Dashboards
              </h1>
            </div>
            <div className="grid gap-4">
              {dynamicDashboards.map((db) => (
                <Card
                  key={db.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSelectDashboard(db)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{db.name}</CardTitle>
                    {db.description && (
                      <CardDescription>{db.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Carregando dados...</p>
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg text-center shadow-lg">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <FileSpreadsheet className="h-16 w-16 text-orange-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Dashboard
              </CardTitle>
              <CardDescription className="text-base mt-2">
                sem dados para analise, importar arquivo primeiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/upload')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium"
                size="lg"
              >
                Importar arquivo
              </Button>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                Suportamos arquivos Excel (.xlsx, .xls)
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Dashboard com dados
  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        {/* Filtro de Período */}
        <div className="max-w-7xl mx-auto mb-6">
          <DateFilter 
            periodFilter={periodFilter} 
            onPeriodChange={setPeriodFilter} 
          />
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

        {/* KPIs - Sempre visível quando tem dados no sistema */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Receita Total */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base sm:text-sm font-medium text-slate-600">
                Receita Total
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total de entradas
              </p>
            </CardContent>
          </Card>

          {/* Despesas Totais */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base sm:text-sm font-medium text-slate-600">
                Despesas Totais
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpense)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total de saídas
              </p>
            </CardContent>
          </Card>

          {/* Lucro/Prejuízo */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base sm:text-sm font-medium text-slate-600">
                {summary.profit >= 0 ? 'Lucro' : 'Prejuízo'}
              </CardTitle>
              <DollarSign className={`h-5 w-5 ${summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl sm:text-2xl font-bold ${summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(summary.profit)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Financeiros - LOTE 5: Individualizados com filtros próprios */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Gráficos Financeiros
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Gráfico de Tendência */}
            <TrendChart
              trendData={trendData}
              currentFilter={getEffectiveFilter(GraphType.TREND)}
              globalFilter={periodFilter}
              onFilterChange={handleGraphFilterChange}
              onResetFilter={handleResetGraphFilter}
            />

            {/* Gráfico de Categorias */}
            <CategoryChart
              categoryData={categoryData}
              currentFilter={getEffectiveFilter(GraphType.CATEGORY)}
              globalFilter={periodFilter}
              onFilterChange={handleGraphFilterChange}
              onResetFilter={handleResetGraphFilter}
            />

            {/* Gráfico Mensal */}
            <MonthlyChart
              monthlyData={monthlyData}
              currentFilter={getEffectiveFilter(GraphType.MONTHLY)}
              globalFilter={periodFilter}
              onFilterChange={handleGraphFilterChange}
              onResetFilter={handleResetGraphFilter}
            />
          </div>
        </div>

        {/* Gráficos Operacionais - NOVO (Máquinas de Vending) */}
        {showOperationalGraphs && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coffee className="h-6 w-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Gráficos Operacionais
                </h2>
              </div>
              
              {/* Summary badges */}
              <div className="flex gap-3">
                <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="text-sm font-medium text-blue-700">
                    {vendingSummary.totalMachines} Máquinas
                  </span>
                </div>
                <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-md">
                  <span className="text-sm font-medium text-green-700">
                    {vendingSummary.totalSales} Vendas
                  </span>
                </div>
              </div>
            </div>

            {isLoadingVending ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-lg text-slate-600">Carregando métricas operacionais...</p>
              </div>
            ) : vendingError ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">⚠️ {vendingError}</p>
                <p className="text-sm text-yellow-600 mt-2">
                  Os gráficos operacionais estão temporariamente indisponíveis.
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

        {/* Informações adicionais */}
        <div className="max-w-7xl mx-auto mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Dados carregados com sucesso • {metadata?.totalTransactionsInSystem || 0} transações no sistema
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
