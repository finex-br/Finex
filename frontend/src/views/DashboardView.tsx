import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Upload, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useAuthStore } from '@/store/authStore';
import { DateFilter } from '@/components/DateFilter';
import { FinancialCharts } from '@/components/FinancialCharts';

/**
 * DashboardView - Componente Presentacional (Dumb Component)
 * 
 * Responsabilidades:
 * - Renderizar KPIs e gráficos
 * - Exibir feedback visual (loading, erro)
 * 
 * TODA lógica está no useFinancialData (ViewModel).
 * Backend processa e agrega dados (frontend apenas exibe).
 */
export function DashboardView() {
  const navigate = useNavigate();
  const { currentCompanyId } = useAuthStore();
  const { 
    summary, 
    monthlyData,
    categoryData,
    trendData,
    hasData, 
    isLoading,
    error,
    periodFilter,
    setPeriodFilter,
    fetchFinancialData 
  } = useFinancialData();

  // Busca dados ao montar o componente ou quando periodFilter mudar
  useEffect(() => {
    if (currentCompanyId) {
      fetchFinancialData(currentCompanyId);
    }
  }, [currentCompanyId, periodFilter]);

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
              onClick={() => fetchFinancialData(currentCompanyId)}
              variant="outline"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado vazio - sem dados carregados
  if (!hasData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <FileSpreadsheet className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Bem-vindo ao Dashboard
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Importe sua planilha financeira para visualizar seus dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/upload')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium"
              size="lg"
            >
              <Upload className="mr-2 h-5 w-5" />
              Importar Planilha
            </Button>
            <p className="text-sm text-slate-500 mt-4">
              Suportamos arquivos Excel (.xlsx, .xls)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard com dados
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-orange-600">FinEx</h1>
              <p className="text-sm text-slate-600 mt-1">Dashboard Financeiro</p>
            </div>
            <Button
              onClick={() => navigate('/upload')}
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              <Upload className="mr-2 h-4 w-4" />
              Nova Importação
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtro de Período */}
        <div className="mb-6">
          <DateFilter 
            periodFilter={periodFilter} 
            onPeriodChange={setPeriodFilter} 
          />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Gráficos Financeiros */}
        <FinancialCharts 
          categoryData={categoryData}
          trendData={trendData}
          monthlyData={monthlyData}
        />

        {/* Informações adicionais */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Dados financeiros carregados com sucesso
          </p>
        </div>
      </main>
    </div>
  );
}
