import { Skeleton } from '@/components/ui/skeleton';

/**
 * DashboardSelectorSkeleton — Loading placeholder that mirrors
 * the DashboardCard layout (icon circle + title + description + footer).
 */
export function DashboardSelectorSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="surface-elevated p-5 md:p-6">
          {/* Icon circle */}
          <Skeleton className="w-11 h-11 rounded-xl mb-4" />
          {/* Title */}
          <Skeleton className="h-4 w-3/5 rounded mb-3" />
          {/* Description lines */}
          <Skeleton className="h-3 w-full rounded mb-1.5" />
          <Skeleton className="h-3 w-4/5 rounded mb-4" />
          {/* Footer */}
          <div className="pt-3 border-t border-border/50">
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
