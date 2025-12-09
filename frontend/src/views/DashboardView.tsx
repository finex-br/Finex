import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Upload, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancialContext } from '@/context/FinancialContext';

/**
 * DashboardView - Painel de controle financeiro
 * 
 * Exibe:
 * - KPIs (Receita Total, Despesas Totais, Lucro)
 * - Gráfico de barras comparativo (Receita vs Despesas por mês)
 * - Estado vazio com botão para importar planilha
 */
export function DashboardView() {
  const navigate = useNavigate();
  const { cashFlow, summary, monthlyData } = useFinancialContext();

  // Formata valores em Real Brasileiro
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Estado vazio - sem dados carregados
  if (cashFlow.length === 0) {
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

        {/* Gráfico de Barras */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">
              Receitas vs Despesas por Mês
            </CardTitle>
            <CardDescription>
              Comparativo mensal do fluxo de caixa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="receita" 
                    fill="#16a34a" 
                    name="Receitas"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="despesa" 
                    fill="#dc2626" 
                    name="Despesas"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Exibindo {cashFlow.length} {cashFlow.length === 1 ? 'transação' : 'transações'}
          </p>
        </div>
      </main>
    </div>
  );
}
