# Components

## Organização

### `ui/` — shadcn/ui (50+ componentes)
Gerados via CLI. **Não editar manualmente.** Para adicionar: `npx shadcn-ui add <nome>`.
Button, Card, Dialog, Form, Input, Select, Table, Tabs, Chart, Calendar, Toast, etc.

### Layout
- `AppLayout.tsx` — wrapper principal (sidebar + content)
- `Sidebar.tsx` — navegação lateral
- `MobileTopBar.tsx` — nav mobile
- `NavLink.tsx` — link de navegação
- `PageHeader.tsx` — título de página

### Dashboard
- `KPICard.tsx` — card de indicador
- `DateFilter.tsx` — filtro global de período
- `GraphDateFilter.tsx` — filtro individual por gráfico
- `FinancialCharts.tsx` — wrapper de gráficos
- `EmptyPeriodBanner.tsx` — estado vazio

### `charts/` — Recharts
- `TrendChart.tsx` — receita/despesa/lucro ao longo do tempo
- `CategoryChart.tsx` — breakdown por categoria
- `MonthlyChart.tsx` — agregação mensal

### Outros
- `ThemeToggle.tsx` — alternância dark/light mode
