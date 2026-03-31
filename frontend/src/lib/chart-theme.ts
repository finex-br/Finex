/**
 * Constantes de theming para graficos Recharts.
 * Usa CSS variables para funcionar em dark/light mode.
 */

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const;

export const SEMANTIC_COLORS = {
  revenue: "hsl(var(--success))",
  expense: "hsl(var(--destructive))",
  profit: "hsl(var(--chart-1))",
  neutral: "hsl(var(--muted-foreground))",
} as const;

export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  color: "hsl(var(--foreground))",
  fontSize: "0.75rem",
  padding: "8px 12px",
};

export const GRID_STYLE = {
  stroke: "hsl(var(--border))",
  strokeDasharray: "3 3",
  opacity: 0.5,
} as const;

export const AXIS_STYLE = {
  tick: {
    fill: "hsl(var(--muted-foreground))",
    fontSize: 11,
  },
  axisLine: {
    stroke: "hsl(var(--border))",
  },
} as const;
