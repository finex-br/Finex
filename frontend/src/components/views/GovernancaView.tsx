import { 
  FileCheck, 
  FileWarning, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const pendingApprovals = [
  {
    id: 1,
    title: "Aprovar Orçamento Q3 2024",
    category: "Financeiro",
    requester: "Maria Silva",
    dueDate: "15 Dez 2024",
    priority: "urgente",
    status: "pending",
    value: "R$ 2.450.000",
  },
  {
    id: 2,
    title: "Revisar Contrato Fornecedor XYZ",
    category: "Jurídico",
    requester: "Carlos Santos",
    dueDate: "18 Dez 2024",
    priority: "importante",
    status: "pending",
    value: "R$ 780.000",
  },
  {
    id: 3,
    title: "Validar Projeções 2025",
    category: "Planejamento",
    requester: "Ana Costa",
    dueDate: "28 Dez 2024",
    priority: "normal",
    status: "in-progress",
    value: "-",
  },
  {
    id: 4,
    title: "Aprovar Plano de Expansão",
    category: "Estratégico",
    requester: "Pedro Lima",
    dueDate: "10 Jan 2025",
    priority: "urgente",
    status: "pending",
    value: "R$ 5.200.000",
  },
  {
    id: 5,
    title: "Homologar Política de TI",
    category: "Compliance",
    requester: "Lucas Oliveira",
    dueDate: "22 Dez 2024",
    priority: "importante",
    status: "pending",
    value: "-",
  },
];

const approvalsByMonth = [
  { mes: "Jul", aprovados: 12, pendentes: 3, rejeitados: 1 },
  { mes: "Ago", aprovados: 15, pendentes: 2, rejeitados: 2 },
  { mes: "Set", aprovados: 18, pendentes: 4, rejeitados: 1 },
  { mes: "Out", aprovados: 14, pendentes: 5, rejeitados: 3 },
  { mes: "Nov", aprovados: 20, pendentes: 3, rejeitados: 1 },
  { mes: "Dez", aprovados: 8, pendentes: 5, rejeitados: 0 },
];

const approvalsByCategory = [
  { name: "Financeiro", value: 35, color: "hsl(24, 100%, 50%)" },
  { name: "Jurídico", value: 20, color: "hsl(173, 80%, 40%)" },
  { name: "Estratégico", value: 25, color: "hsl(197, 71%, 52%)" },
  { name: "Compliance", value: 15, color: "hsl(43, 96%, 56%)" },
  { name: "Outros", value: 5, color: "hsl(280, 65%, 60%)" },
];

const complianceMetrics = [
  { label: "Taxa de Aprovação", value: "94%", change: "+2%", up: true },
  { label: "Tempo Médio", value: "3,2 dias", change: "-0,5 dias", up: true },
  { label: "Pendências", value: "5", change: "+2", up: false },
  { label: "Conformidade", value: "98%", change: "+1%", up: true },
];

const recentDecisions = [
  { id: 1, title: "Renovação de Contrato ERP", decision: "Aprovado", date: "05 Dez 2024", approver: "Eduardo Mendes" },
  { id: 2, title: "Investimento em Marketing Digital", decision: "Aprovado", date: "03 Dez 2024", approver: "Eduardo Mendes" },
  { id: 3, title: "Contratação Equipe Comercial", decision: "Aprovado", date: "01 Dez 2024", approver: "Eduardo Mendes" },
  { id: 4, title: "Mudança de Escritório", decision: "Rejeitado", date: "28 Nov 2024", approver: "Eduardo Mendes" },
];

export function GovernancaView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Governança Corporativa
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Central de aprovações, decisões e conformidade
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {complianceMetrics.map((metric, index) => (
          <div
            key={metric.label}
            className="glass-card p-4 animate-fade-in"
            style={{ animationDelay: `${100 + index * 100}ms` }}
          >
            <p className="text-xs md:text-sm text-muted-foreground mb-1">{metric.label}</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">{metric.value}</p>
            <p
              className={`text-xs md:text-sm flex items-center gap-1 mt-1 ${
                metric.up ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {metric.up ? (
                <ArrowUp className="w-3 h-3 md:w-4 md:h-4" />
              ) : (
                <ArrowDown className="w-3 h-3 md:w-4 md:h-4" />
              )}
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Aprovações Pendentes
            </h2>
            <p className="text-sm text-muted-foreground">
              {pendingApprovals.length} itens aguardando sua decisão
            </p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
            Aprovar em Lote
          </button>
        </div>
        <div className="space-y-3 overflow-x-auto">
          {pendingApprovals.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors animate-slide-in-left gap-3"
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              <div className="flex items-start md:items-center gap-4">
                {item.status === "pending" ? (
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-chart-3 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.category} • {item.requester} • Prazo: {item.dueDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-9 md:ml-0">
                {item.value !== "-" && (
                  <span className="text-sm font-semibold text-foreground">
                    {item.value}
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                    item.priority === "urgente"
                      ? "bg-red-500/10 text-red-400"
                      : item.priority === "importante"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <FileWarning className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals by Month */}
        <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: "1100ms" }}>
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">
            Histórico de Aprovações
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalsByMonth}>
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 6%)",
                    border: "1px solid hsl(217, 33%, 17%)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="aprovados" fill="hsl(142, 76%, 36%)" name="Aprovados" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pendentes" fill="hsl(38, 92%, 50%)" name="Pendentes" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejeitados" fill="hsl(0, 84%, 60%)" name="Rejeitados" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approvals by Category */}
        <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: "1200ms" }}>
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">
            Distribuição por Categoria
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={approvalsByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {approvalsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 6%)",
                    border: "1px solid hsl(217, 33%, 17%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            {approvalsByCategory.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs md:text-sm text-muted-foreground truncate">
                  {item.name}
                </span>
                <span className="text-xs md:text-sm font-semibold text-foreground ml-auto">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Decisions */}
      <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: "1300ms" }}>
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">
          Decisões Recentes
        </h2>
        <div className="space-y-3">
          {recentDecisions.map((decision, index) => (
            <div
              key={decision.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-accent/50 gap-2"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{decision.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {decision.date} • {decision.approver}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${
                  decision.decision === "Aprovado"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {decision.decision}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
