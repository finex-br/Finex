import { Target, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const radarData = [
  { area: "Financeiro", score: 88, fullMark: 100 },
  { area: "Operacional", score: 75, fullMark: 100 },
  { area: "Vendas", score: 92, fullMark: 100 },
  { area: "Marketing", score: 68, fullMark: 100 },
  { area: "Gestão", score: 85, fullMark: 100 },
];

const improvements = [
  {
    area: "Marketing",
    current: 68,
    potential: 85,
    action: "Implementar automação de marketing e CRM integrado",
    impact: "+R$ 180.000/ano",
    priority: "alta",
  },
  {
    area: "Operacional",
    current: 75,
    potential: 90,
    action: "Otimizar processos com metodologia Lean Six Sigma",
    impact: "-15% custos operacionais",
    priority: "média",
  },
  {
    area: "Gestão",
    current: 85,
    potential: 95,
    action: "Implementar OKRs e reuniões de alinhamento semanais",
    impact: "+20% produtividade",
    priority: "média",
  },
  {
    area: "Financeiro",
    current: 88,
    potential: 95,
    action: "Automatizar conciliação bancária e previsões de fluxo",
    impact: "-8h/mês em tarefas manuais",
    priority: "baixa",
  },
];

export function MaturidadeView() {
  const overallScore = 82;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Avaliação de Maturidade Empresarial
        </h1>
        <p className="text-lg text-muted-foreground">
          BMA - Business Maturity Assessment
        </p>
      </div>

      {/* Main Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Score Circle */}
        <div className="glass-card p-6 md:p-8 flex flex-col items-center justify-center animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="relative w-40 h-40 md:w-48 md:h-48">
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(217, 33%, 17%)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(24, 100%, 50%)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 283} 283`}
                className="animate-[draw_1.5s_ease-out_forwards]"
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl md:text-5xl font-bold text-foreground">{overallScore}</span>
              <span className="text-base md:text-lg text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="mt-4 md:mt-6 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
              <CheckCircle className="w-5 h-5" />
              Nível Avançado
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-3 md:mt-4 text-center">
            Sua empresa está no top 15% do mercado em maturidade empresarial
          </p>
        </div>

        {/* Radar Chart */}
  <div className="md:col-span-1 lg:col-span-2 glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Diagnóstico por Área
          </h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid
                  stroke="hsl(217, 33%, 20%)"
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis
                  dataKey="area"
                  tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(24, 100%, 50%)"
                  fill="hsl(24, 100%, 50%)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Area Breakdown */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {radarData.map((item, index) => (
          <div
            key={item.area}
            className="glass-card p-4 animate-fade-in"
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm text-muted-foreground">{item.area}</span>
              <span
                className={`text-lg font-bold ${
                  item.score >= 85
                    ? "text-emerald-400"
                    : item.score >= 70
                    ? "text-warning"
                    : "text-red-400"
                }`}
              >
                {item.score}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  item.score >= 85
                    ? "bg-emerald-400"
                    : item.score >= 70
                    ? "bg-warning"
                    : "bg-red-400"
                }`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Improvements */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "800ms" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Recomendações de Melhoria
            </h2>
            <p className="text-sm text-muted-foreground">
              Ações priorizadas para aumentar seu score
            </p>
          </div>
          <Target className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-3 md:space-y-4">
          {improvements.map((item, index) => (
            <div
              key={item.area}
              className="p-3 md:p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors animate-slide-in-left"
              style={{ animationDelay: `${900 + index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <span className="text-sm md:text-base font-semibold text-foreground">{item.area}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        item.priority === "alta"
                          ? "bg-red-500/10 text-red-400"
                          : item.priority === "média"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      Prioridade {item.priority}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3">
                    {item.action}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm text-muted-foreground">Atual:</span>
                      <span className="text-sm md:text-base font-semibold text-foreground">{item.current}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm text-muted-foreground">Potencial:</span>
                      <span className="text-sm md:text-base font-semibold text-emerald-400">{item.potential}</span>
                    </div>
                  </div>
                </div>
                <div className="md:text-right">
                  <span className="text-xs md:text-sm text-muted-foreground">Impacto</span>
                  <p className="text-sm md:text-base font-semibold text-primary">{item.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
