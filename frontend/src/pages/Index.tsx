import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { MaturidadeView } from "@/components/views/MaturidadeView";
import { EquityView } from "@/components/views/EquityView";
import { ValorInvisivelView } from "@/components/views/ValorInvisivelView";
import { GovernancaView } from "@/components/views/GovernancaView";
import { DateFilter } from "@/components/DateFilter";
import { cn } from "@/lib/utils";
import { MobileTopBar } from "@/components/MobileTopBar";

type View = "dashboard" | "maturidade" | "equity" | "valor-invisivel" | "governanca";

const Index = () => {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dateFilter, setDateFilter] = useState("12m");

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />;
      case "maturidade":
        return <MaturidadeView />;
      case "equity":
        return <EquityView />;
      case "valor-invisivel":
        return <ValorInvisivelView />;
      case "governanca":
        return <GovernancaView />;
      default:
        return <DashboardView />;
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "dashboard":
        return "Visão Geral";
      case "maturidade":
        return "Maturidade";
      case "equity":
        return "Equity & Valuation";
      case "valor-invisivel":
        return "Valor Invisível";
      case "governanca":
        return "Governança";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar with theme toggle and menu */}
      <MobileTopBar onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={cn(
          "min-h-screen transition-all duration-300 p-4 md:p-8",
          isSidebarCollapsed ? "ml-16 md:ml-20" : "ml-56 md:ml-64"
        )}
      >
        <div className="max-w-7xl mx-auto">
          {/* Top Bar with Date Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
            <h2 className="text-lg font-medium text-muted-foreground">
              {getViewTitle()}
            </h2>
            <DateFilter value={dateFilter} onChange={setDateFilter} />
          </div>
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
