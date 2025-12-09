import { Zap, Rocket, Lightbulb, ShieldAlert } from "lucide-react";

export function ValorInvisivelView() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Valor Invisível</h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Oportunidades detectadas por IA que ainda não estão no seu radar
        </p>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Matriz de Priorização (Esforço x Impacto)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Vitórias rápidas */}
          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              <h3 className="text-base md:text-lg font-semibold">Vitórias rápidas</h3>
            </div>
            <ul className="space-y-2">
              <li className="text-sm md:text-base">Onboarding guiado para 3 features principais (↑ LTV)</li>
              <li className="text-sm md:text-base">Ajuste de preço em contas com alto uso (↑ margem)</li>
              <li className="text-sm md:text-base">Template de proposta padronizado (↓ ciclo de venda)</li>
            </ul>
          </div>

          {/* Apostas estratégicas */}
          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h3 className="text-base md:text-lg font-semibold">Apostas estratégicas</h3>
            </div>
            <ul className="space-y-2">
              <li className="text-sm md:text-base">Programa de marca e posicionamento (↑ conversão)</li>
              <li className="text-sm md:text-base">Data mart de clientes para pricing dinâmico</li>
              <li className="text-sm md:text-base">Automação de processos críticos (↓ custo)</li>
            </ul>
          </div>

          {/* Manter sob observação */}
          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-chart-4" />
              <h3 className="text-base md:text-lg font-semibold">Manter sob observação</h3>
            </div>
            <ul className="space-y-2">
              <li className="text-sm md:text-base">Novos segmentos com baixa penetração</li>
              <li className="text-sm md:text-base">Parcerias com integradores (pilotos)</li>
            </ul>
          </div>

          {/* Evitar */}
          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              <h3 className="text-base md:text-lg font-semibold">Evitar</h3>
            </div>
            <ul className="space-y-2">
              <li className="text-sm md:text-base">Expansões sem dados de retenção</li>
              <li className="text-sm md:text-base">Customizações pesadas com baixo ROI</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}