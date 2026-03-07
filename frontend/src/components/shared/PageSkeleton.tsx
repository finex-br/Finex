import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  cards?: number;
  charts?: number;
}

export function PageSkeleton({ cards = 3, charts = 2 }: PageSkeletonProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-8 w-64" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="glass-card p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="w-16 h-6 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: charts }).map((_, i) => (
          <div key={i} className="glass-card p-4 md:p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
