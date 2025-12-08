import { DollarSign, TrendingUp, Timer, Building2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { mes: "Jan", receita: 420000, despesas: 280000 },
  { mes: "Fev", receita: 480000, despesas: 290000 },
  { mes: "Mar", receita: 510000, despesas: 310000 },
  { mes: "Abr", receita: 550000, despesas: 320000 },
  { mes: "Mai", receita: 620000, despesas: 340000 },
  { mes: "Jun", receita: 680000, despesas: 350000 },
  { mes: "Jul", receita: 720000, despesas: 360000 },
  { mes: "Ago", receita: 780000, despesas: 380000 },
  { mes: "Set", receita: 850000, despesas: 400000 },
  { mes: "Out", receita: 920000, despesas: 420000 },
  { mes: "Nov", receita: 980000, despesas: 440000 },
  { mes: "Dez", receita: 1050000, despesas: 460000 },
];

const pendingActions = [
  {
    id: 1,
    title: "Aprovar Orçamento Q3",
    type: "urgente",
    dueDate: "15 Dez 2024",
    status: "pending",
  },
  {
    id: 2,
    title: "Revisar Contrato de Fornecedor",
    type: "importante",
    dueDate: "20 Dez 2024",
    status: "pending",
  },
  {
    id: 3,
    title: "Validar Projeções 2025",
    type: "normal",
    dueDate: "28 Dez 2024",
    status: "in-progress",
  },
  {
    id: 4,
    title: "Aprovar Plano de Expansão",
    type: "urgente",
    dueDate: "10 Jan 2025",
    status: "pending",
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function DashboardView() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Bom dia, Eduardo.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          A saúde da <span className="text-primary font-semibold">Singular</span> está{" "}
          <span className="text-emerald-400 font-semibold">excelente</span>.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          title="Faturamento Mensal"
          value="R$ 1.050.000"
          trend="12,5%"
          trendUp={true}
          icon={DollarSign}
          subtitle="vs. mês anterior"
          delay={100}
        />
        <KPICard
          title="Lucro Líquido"
          value="R$ 590.000"
          trend="8,2%"
          trendUp={true}
          icon={TrendingUp}
          subtitle="Margem de 56%"
          delay={200}
        />
        <KPICard
          title="Runway"
          value="18 meses"
          trend="3 meses"
          trendUp={true}
          icon={Timer}
          subtitle="Baseado no burn rate atual"
          delay={300}
        />
        <KPICard
          title="Valuation Atual"
          value="R$ 15,4M"
          trend="22%"
          trendUp={true}
          icon={Building2}
          subtitle="Última avaliação: Nov/2024"
          delay={400}
        />
      </div>

      {/* Main Chart */}
      <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Receita vs Despesas
            </h2>
            <p className="text-sm text-muted-foreground">
              Últimos 12 meses
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs md:text-sm text-muted-foreground">Receita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-2" />
              <span className="text-xs md:text-sm text-muted-foreground">Despesas</span>
            </div>
          </div>
        </div>
        <div className="h-60 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
              <XAxis
                dataKey="mes"
                stroke="hsl(215, 20%, 55%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(215, 20%, 55%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 6%)",
                  border: "1px solid hsl(217, 33%, 17%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
                labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                formatter={(value: number) => [formatCurrency(value), ""]}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="hsl(24, 100%, 50%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReceita)"
                name="Receita"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                stroke="hsl(173, 80%, 40%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDespesas)"
                name="Despesas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: "600ms" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Ações de Governança Pendentes
            </h2>
            <p className="text-sm text-muted-foreground">
              {pendingActions.length} itens aguardando sua aprovação
            </p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
            Ver Todas
          </button>
        </div>
        <div className="space-y-3">
          {pendingActions.map((action, index) => (
            <div
              key={action.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors animate-slide-in-left gap-3"
              style={{ animationDelay: `${700 + index * 100}ms` }}
            >
              <div className="flex items-center gap-3 md:gap-4">
                {action.status === "pending" ? (
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-chart-3 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-foreground text-sm md:text-base">{action.title}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Prazo: {action.dueDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-8 md:ml-0">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    action.type === "urgente"
                      ? "bg-red-500/10 text-red-400"
                      : action.type === "importante"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                </span>
                <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground hover:text-primary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
