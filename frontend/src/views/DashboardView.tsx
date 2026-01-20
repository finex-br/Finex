import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancialData, DashboardState } from '@/hooks/useFinancialData';
import { useAuthStore } from '@/store/authStore';
import { DateFilter } from '@/components/DateFilter';
import { TrendChart } from '@/components/charts/TrendChart';
import { CategoryChart } from '@/components/charts/CategoryChart';
import { MonthlyChart } from '@/components/charts/MonthlyChart';
import { EmptyPeriodBanner } from '@/components/EmptyPeriodBanner';
import { GraphType } from '@/services/financialService';
import { AppLayout } from '@/components/AppLayout';

/**
 * DashboardView - Componente Presentacional (Dumb Component)
 * 
 * Responsabilidades:
 * - Renderizar KPIs e gráficos
 * - Exibir feedback visual (loading, erro)
 * - LOTE 4: Usar dashboardState para NUNCA desaparecer quando filtro vazio
 * 
 * TODA lógica está no useFinancialData (ViewModel).
 * Backend processa e agrega dados (frontend apenas exibe).
 */
export function DashboardView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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

  // Busca dados ao montar o componente ou quando periodFilter mudar
  useEffect(() => {
    console.log('[DashboardView] useEffect triggered:', { 
      userId: user?.id, 
      userName: user?.name,
      periodFilter 
    });
    fetchFinancialData();
  }, [user?.id, periodFilter]);

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

  // Estado de loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-lg text-slate-600">Carregando dados...</p>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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
              <CardTitle className="text-sm font-medium text-slate-600">
                Receita Total
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
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
              <CardTitle className="text-sm font-medium text-slate-600">
                Despesas Totais
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
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
              <CardTitle className="text-sm font-medium text-slate-600">
                {summary.profit >= 0 ? 'Lucro' : 'Prejuízo'}
              </CardTitle>
              <DollarSign className={`h-5 w-5 ${summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(summary.profit)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Financeiros - LOTE 5: Individualizados com filtros próprios */}
        <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2">
          {/* Gráfico de Tendência (Largura Total) */}
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

        {/* Informações adicionais */}
        <div className="max-w-7xl mx-auto mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Dados financeiros carregados com sucesso
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
