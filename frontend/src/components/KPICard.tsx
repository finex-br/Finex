import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  subtitle?: string;
  delay?: number;
}

export function KPICard({
  title,
  value,
  trend,
  trendUp = true,
  icon: Icon,
  subtitle,
  delay = 0,
}: KPICardProps) {
  return (
    <div
      className="glass-card-hover p-4 md:p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs md:text-sm font-semibold px-2 py-1 rounded-lg flex items-center gap-1",
              trendUp
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            {trendUp ? (
              <ArrowUp className="w-3 h-3 md:w-4 md:h-4" />
            ) : (
              <ArrowDown className="w-3 h-3 md:w-4 md:h-4" />
            )}
            {trend}
          </span>
        )}
      </div>
      <p className="stat-label mb-1 text-xs md:text-sm">{title}</p>
      <p className="stat-value text-foreground text-xl md:text-3xl">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      )}
    </div>
  );
}
