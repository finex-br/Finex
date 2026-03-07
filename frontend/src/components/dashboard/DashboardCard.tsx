import { Clock } from 'lucide-react';
import { getDashboardVisuals } from '@/lib/dashboardVisuals';
import type { Dashboard } from '@/services/dashboardService';

interface DashboardCardProps {
  dashboard: Dashboard;
  onSelect: (dashboard: Dashboard) => void;
  delay?: number;
}

/**
 * Formats a date string to a relative "time ago" label in Portuguese.
 */
function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `Ha ${diffMin} min`;
  if (diffHours < 24) return `Ha ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 30) return `Ha ${diffDays} dias`;
  if (diffDays < 365) return `Ha ${Math.floor(diffDays / 30)} meses`;
  return `Ha ${Math.floor(diffDays / 365)} anos`;
}

/**
 * DashboardCard — Apple-style visual card for dashboard selection.
 *
 * Features a gradient icon circle, title, description (2-line clamp),
 * and a subtle "updated at" footer. Uses surface-elevated with hover lift.
 */
export function DashboardCard({ dashboard, onSelect, delay = 0 }: DashboardCardProps) {
  const visuals = getDashboardVisuals(dashboard.id);
  const Icon = visuals.icon;

  return (
    <div
      className="surface-elevated p-5 md:p-6 cursor-pointer transition-all duration-200 hover:translate-y-[-2px] opacity-0 animate-fade-in-up"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
      onClick={() => onSelect(dashboard)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(dashboard);
        }
      }}
    >
      {/* Icon circle with gradient */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `linear-gradient(135deg, ${visuals.gradient.from}, ${visuals.gradient.to})`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: visuals.iconColor }} />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {dashboard.name}
      </h3>

      {/* Description — 2 lines max */}
      {dashboard.description && (
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {dashboard.description}
        </p>
      )}

      {/* Footer: updated at */}
      {dashboard.updatedAt && (
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border/50">
          <Clock className="w-3 h-3 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground/60">
            {formatRelativeTime(dashboard.updatedAt)}
          </span>
        </div>
      )}
    </div>
  );
}
