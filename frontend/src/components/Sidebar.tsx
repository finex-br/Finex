import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Sparkles,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Scale,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type View = "dashboard" | "maturidade" | "equity" | "valor-invisivel" | "governanca";

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  {
    id: "dashboard" as View,
    label: "Visão Geral",
    icon: LayoutDashboard,
  },
  {
    id: "maturidade" as View,
    label: "Maturidade",
    icon: Target,
  },
  {
    id: "equity" as View,
    label: "Equity & Valuation",
    icon: TrendingUp,
  },
  {
    id: "governanca" as View,
    label: "Governança",
    icon: Scale,
  },
  {
    id: "valor-invisivel" as View,
    label: "Valor Invisível",
    icon: Sparkles,
  },
];

export function Sidebar({
  activeView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        isCollapsed ? "w-16 md:w-20" : "w-56 md:w-64"
      )}
    >
      {/* Company Info */}
      <div className="p-4 md:p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center animate-pulse-glow flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm md:text-lg">S</span>
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0">
              <h1 className="text-base md:text-xl font-bold text-foreground truncate">Singular Tech</h1>
              <p className="text-xs text-muted-foreground truncate">CNPJ: 12.345.678/0001-90</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
        <p className={cn(
          "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 md:mb-4 px-3 md:px-4 transition-opacity",
          isCollapsed && "opacity-0"
        )}>
          Módulos
        </p>
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full sidebar-item text-sm md:text-base",
              activeView === item.id && "sidebar-item-active",
              isCollapsed && "justify-center px-2"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <item.icon
              className={cn(
                "w-4 h-4 md:w-5 md:h-5 flex-shrink-0",
                activeView === item.id && "text-primary"
              )}
            />
            {!isCollapsed && (
              <span className="font-medium truncate">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 md:p-4 border-t border-sidebar-border space-y-1 md:space-y-2">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn("w-full sidebar-item text-sm md:text-base", isCollapsed && "justify-center px-2")}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          ) : (
            <Moon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          )}
          {!isCollapsed && <span className="font-medium">{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>
        <button className={cn("w-full sidebar-item text-sm md:text-base", isCollapsed && "justify-center px-2")}>
          <Bell className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Notificações</span>}
          {!isCollapsed && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              3
            </span>
          )}
        </button>
        <button className={cn("w-full sidebar-item text-sm md:text-base", isCollapsed && "justify-center px-2")}>
          <Settings className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Configurações</span>}
        </button>
        <button className={cn("w-full sidebar-item text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm md:text-base", isCollapsed && "justify-center px-2")}>
          <LogOut className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
