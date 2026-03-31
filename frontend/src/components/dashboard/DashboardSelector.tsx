import { LayoutDashboard } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { DashboardSelectorSkeleton } from './DashboardSelectorSkeleton';
import type { Dashboard } from '@/services/dashboardService';

interface DashboardSelectorProps {
  dashboards: Dashboard[];
  onSelect: (dashboard: Dashboard) => void;
  isLoading: boolean;
}

/**
 * DashboardSelector — Grid of visual dashboard cards.
 *
 * Renders a responsive grid (1/2/3 cols) of DashboardCard components
 * with staggered entrance animation. Shows a skeleton grid while loading.
 */
export function DashboardSelector({ dashboards, onSelect, isLoading }: DashboardSelectorProps) {
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Dashboards
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-[30px]">
            Selecione um dashboard para visualizar
          </p>
        </div>
        <DashboardSelectorSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboards
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-[30px]">
          {dashboards.length} {dashboards.length === 1 ? 'dashboard disponivel' : 'dashboards disponiveis'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {dashboards.map((dashboard, index) => (
          <DashboardCard
            key={dashboard.id}
            dashboard={dashboard}
            onSelect={onSelect}
            delay={index * 75}
          />
        ))}
      </div>
    </div>
  );
}
