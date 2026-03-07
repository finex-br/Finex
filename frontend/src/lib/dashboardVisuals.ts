import {
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  LineChart,
  Target,
  Gauge,
  Zap,
  LayoutGrid,
  Layers,
  type LucideIcon,
} from 'lucide-react';

interface DashboardVisuals {
  icon: LucideIcon;
  gradient: { from: string; to: string };
  iconColor: string;
}

const ICONS: LucideIcon[] = [
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  LineChart,
  Target,
  Gauge,
  Zap,
  LayoutGrid,
  Layers,
];

const GRADIENTS: { from: string; to: string; iconColor: string }[] = [
  { from: '#006680', to: '#00A896', iconColor: '#ffffff' },   // Navy -> Teal (brand)
  { from: '#5B4FD6', to: '#8B7CF6', iconColor: '#ffffff' },   // Indigo -> Violet
  { from: '#0A84FF', to: '#64D2FF', iconColor: '#ffffff' },   // Blue -> Cyan
  { from: '#30D158', to: '#A8E063', iconColor: '#ffffff' },   // Green -> Lime
  { from: '#FF6B35', to: '#FFB347', iconColor: '#ffffff' },   // Orange -> Peach
  { from: '#BF5AF2', to: '#DA8FFF', iconColor: '#ffffff' },   // Purple -> Lavender
  { from: '#FF375F', to: '#FF6B8A', iconColor: '#ffffff' },   // Pink -> Rose
  { from: '#00796B', to: '#4DB6AC', iconColor: '#ffffff' },   // Teal -> Mint
  { from: '#1565C0', to: '#42A5F5', iconColor: '#ffffff' },   // Deep Blue -> Sky
  { from: '#6D4C41', to: '#A1887F', iconColor: '#ffffff' },   // Brown -> Tan
];

/**
 * Simple hash from string to stable numeric index.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic icon + gradient for a dashboard based on its ID.
 * The same ID always produces the same visual, avoiding backend changes.
 */
export function getDashboardVisuals(dashboardId: string): DashboardVisuals {
  const hash = hashString(dashboardId);
  const iconIndex = hash % ICONS.length;
  const gradientIndex = (hash >> 4) % GRADIENTS.length;
  const gradient = GRADIENTS[gradientIndex];

  return {
    icon: ICONS[iconIndex],
    gradient: { from: gradient.from, to: gradient.to },
    iconColor: gradient.iconColor,
  };
}
