import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyState";
import { BarChart3 } from "lucide-react";

interface ChartWrapperProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  filterSlot?: ReactNode;
  className?: string;
}

export function ChartWrapper({
  title,
  icon: Icon,
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "Nenhum dado disponivel para este periodo.",
  filterSlot,
  className,
}: ChartWrapperProps) {
  return (
    <div className={cn("glass-card p-4 md:p-6", className)}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          )}
          <h3 className="text-sm md:text-base font-semibold text-foreground">
            {title}
          </h3>
        </div>
        {filterSlot && <div className="flex-shrink-0">{filterSlot}</div>}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title="Sem dados"
          description={emptyMessage}
        />
      ) : (
        children
      )}
    </div>
  );
}
