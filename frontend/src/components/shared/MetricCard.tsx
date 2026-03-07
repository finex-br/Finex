import { LucideIcon, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
  subtitle?: string;
  delay?: number;
  isLoading?: boolean;
  onClick?: () => void;
}

/**
 * MetricCard — Apple-style KPI card
 *
 * Layout: Large number front-and-center, label above, trend badge right-aligned.
 * Uses JetBrains Mono for financial values via stat-value class.
 * Elevation-based card (no heavy borders).
 */
export function MetricCard({
  title,
  value,
  trend,
  trendDirection = "neutral",
  icon: Icon,
  subtitle,
  delay = 0,
  isLoading = false,
  onClick,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="surface-elevated p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-32 rounded mb-2" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    );
  }

  const TrendIcon =
    trendDirection === "up"
      ? ArrowUp
      : trendDirection === "down"
        ? ArrowDown
        : Minus;

  return (
    <div
      className={cn(
        "surface-elevated p-5 md:p-6 animate-fade-in transition-all duration-200",
        onClick && "cursor-pointer hover:translate-y-[-1px]"
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }
          : undefined
      }
    >
      {/* Header: Title + Icon */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-primary" />
        </div>
      </div>

      {/* Value — Big, monospace */}
      <p className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-mono tabular-nums">
        {value}
      </p>

      {/* Bottom: Subtitle + Trend */}
      <div className="flex items-center justify-between mt-2">
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ml-auto",
              trendDirection === "up" &&
              "bg-success/10 text-success",
              trendDirection === "down" &&
              "bg-destructive/10 text-destructive",
              trendDirection === "neutral" &&
              "bg-muted text-muted-foreground"
            )}
          >
            <TrendIcon className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
