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
import { useAuthStore } from "@/store/authStore";

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
      {/* Logo FinEx */}
      <div className="p-4 md:p-6 border-b border-sidebar-border">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#ff6600' }}>
          {isCollapsed ? 'FX' : 'FinEx'}
        </h1>
      </div>

      {/* User Info */}
      <div className="p-4 md:p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ff6600' }}>
            <span className="font-bold text-base md:text-xl" style={{ color: '#ffffff' }}>
              {useAuthStore.getState().user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0">
              <p className="text-sm font-bold text-foreground truncate">Singular Tech</p>
              <p className="text-xs truncate" style={{ color: '#77849a' }}>
                {useAuthStore.getState().user?.name || 'Usuário'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
        <p className={cn(
          "text-xs font-semibold uppercase tracking-wider mb-3 md:mb-4 px-3 md:px-4 transition-opacity",
          isCollapsed && "opacity-0"
        )} style={{ color: '#77849a' }}>
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
            style={{ 
              animationDelay: `${index * 50}ms`,
              color: activeView === item.id ? '#f96403' : '#77849a'
            }}
          >
            <item.icon
              className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
              style={{ color: activeView === item.id ? '#f96403' : '#77849a' }}
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
          style={{ color: '#77849a' }}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: '#77849a' }} />
          ) : (
            <Moon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: '#77849a' }} />
          )}
          {!isCollapsed && <span className="font-medium">{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
        </button>
        <button className={cn("w-full sidebar-item text-sm md:text-base", isCollapsed && "justify-center px-2")} style={{ color: '#77849a' }}>
          <Bell className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: '#77849a' }} />
          {!isCollapsed && <span className="font-medium">Notificações</span>}
          {!isCollapsed && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ff6600', color: '#ffffff' }}>
              3
            </span>
          )}
        </button>
        <button className={cn("w-full sidebar-item text-sm md:text-base hover:bg-red-500/10", isCollapsed && "justify-center px-2")} style={{ color: '#ee6d70' }}>
          <LogOut className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: '#ee6d70' }} />
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
