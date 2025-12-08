import { Menu, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface MobileTopBarProps {
  onToggleSidebar: () => void;
}

export function MobileTopBar({ onToggleSidebar }: MobileTopBarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn(
      "sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background md:hidden"
    )}>
      <button
        aria-label="Abrir menu"
        className="flex items-center gap-2 px-3 py-2 rounded-lg sidebar-item hover:bg-accent"
        onClick={onToggleSidebar}
      >
        <Menu className="w-5 h-5" />
        <span className="font-medium">Menu</span>
      </button>

      <button
        aria-label="Alternar tema"
        className="flex items-center gap-2 px-3 py-2 rounded-lg sidebar-item hover:bg-accent"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
        <span className="font-medium">{theme === "dark" ? "Claro" : "Escuro"}</span>
      </button>
    </div>
  );
}
