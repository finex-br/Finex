import { useLocation, useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface BottomNavProps {
  items: BottomNavItem[];
}

/**
 * BottomNav — iOS-style tab bar for mobile
 *
 * Clean, minimal bottom navigation with subtle active indicator.
 * Max 5 items visible. Uses surface-translucent for blur effect.
 */
export function BottomNav({ items }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Show only first 5 items on bottom nav
  const visibleItems = items.slice(0, 5);

  return (
    <nav
      role="navigation"
      aria-label="Navegação rápida"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden surface-translucent border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[52px]">
        {visibleItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-[2px] flex-1 h-full cursor-pointer transition-colors duration-150',
                'text-muted-foreground',
                isActive && 'text-primary'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                className={cn(
                  'w-[22px] h-[22px] transition-transform duration-150',
                  isActive && 'scale-105'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
