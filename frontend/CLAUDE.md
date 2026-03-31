# Frontend

## Stack
React 18 + TypeScript + Vite (porta 8080). SWC para compilação rápida. Path alias: `@/` → `src/`.

## UI Framework
shadcn/ui (Radix + TailwindCSS). Componentes em `components/ui/` — **não editar diretamente**, usar CLI `npx shadcn-ui add <component>`. Ícones: Lucide React. Tema: next-themes (dark/light).

## State & Data
- **Zustand** — estado global mínimo (só authStore com token/user/companyId)
- **Axios** — serviços em `services/`. Interceptors automáticos:
  - Request: Bearer token + header `x-company-id` do localStorage
  - Response: 401→redirect `/login`, 403→redirect `/company/setup`
- **React Query** — disponível mas uso limitado atualmente

## Padrão MVVM
Views delegam lógica para hooks `use*ViewModel.ts` em `hooks/`. View é puramente presentacional.

## Routing
react-router-dom com wrappers:
- `ProtectedRoute` — requer auth + empresa selecionada
- `AdminRoute` — requer role ADMIN

## Forms
react-hook-form + zod para validação de schemas.

## Testes
Vitest + React Testing Library. `npm run test` ou `npm run test:watch`.
