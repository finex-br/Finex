import { Skeleton } from '@/components/ui/skeleton';

interface PageHeaderProps {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  isLoading?: boolean;
}

export function PageHeader({ breadcrumb, title, subtitle, actions, isLoading }: PageHeaderProps) {
  if (isLoading) {
    return (
      <div className="mb-6 animate-fade-in">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40 mt-2" />
      </div>
    );
  }

  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {breadcrumb && (
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              {breadcrumb}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
