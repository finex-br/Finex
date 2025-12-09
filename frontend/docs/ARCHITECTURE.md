# Arquitetura do Sistema — Visão Financeira Singular

Este documento descreve a arquitetura atual do front-end do projeto e propõe critérios para decidir entre evoluir a base existente ou recomeçar do zero. O foco é no que já está no repositório e nas extensões naturais.

## Objetivos
- Garantir clareza sobre camadas, responsabilidades e fluxo de dados.
- Explicar decisões de stack, estrutura de pastas e padrões.
- Orientar a avaliação: adaptar a base atual vs iniciar uma nova.

## Stack e Ferramentas
- Vite + React + TypeScript: bundler/dev server rápido, com DX moderna.
- Tailwind CSS: utilitários de estilo com configuração em `tailwind.config.ts`.
- shadcn/ui (componentes em `src/components/ui/`): biblioteca de componentes headless/estilizados sobre Radix UI, integração natural com Tailwind.
- ESLint: regras em `eslint.config.js`.
- PostCSS: pipeline do Tailwind com `postcss.config.js`.

Arquivos-chave:
- `vite.config.ts`: configuração do build/dev.
- `tsconfig*.json`: configs TypeScript (app/node).
- `index.html`: entry HTML para Vite.
- `src/main.tsx`: bootstrap da aplicação React.
- `src/App.tsx`: shell principal da UI.

## Estrutura de Pastas (Front-end)
```
src/
  pages/           # páginas de alto nível (ex.: Index, NotFound)
  views/           # telas/visões de domínio (Dashboard, Equity, etc.)
  components/      # componentes reutilizáveis (UI e específicos)
    ui/            # shadcn/ui + wrappers
  hooks/           # hooks compartilhados
  lib/             # utilitários puros (formatadores, helpers)
  index.css        # estilos globais (Tailwind base)
```

### Contrato por camada
- pages: roteamento e composição de views (boundary da aplicação).
- views: orquestram componentes e lógica de apresentação por domínio.
- components: unidades reutilizáveis (dumb/presentational e smart quando necessário).
- hooks: encapsulam lógica compartilhada (estado local, efeitos, adaptadores).
- lib: funções puras/utilitárias sem dependência de React.

## Roteamento
- Evidência parcial: existem `pages/Index.tsx` e `pages/NotFound.tsx`, porém não há arquivo explícito de `react-router` no contexto listado.
- Opções:
  - Se o projeto usar `react-router-dom`, o roteamento deve viver em `src/App.tsx` ou `src/main.tsx` com `BrowserRouter` e mapeamento de `pages/*`.
  - Se não houver router ainda, recomenda-se adicionar `react-router-dom` para mapear `views/` via `pages/`.

Assunção pragmática: `App.tsx` compõe a navegação (Sidebar, MobileTopBar) e renderiza uma rota corrente para uma `view`.

## Estado e Dados
- Não há Redux/MobX/Zustand no contexto atual. Estado parece local (hooks em `hooks/`).
- Recomendação:
  - Usar Zustand ou React Query conforme necessidade:
    - Zustand para estado de UI/aplicação leve (tema, filtros, sidebar aberta).
    - React Query para dados remotos (cache, sincronização, revalidação).

Fluxo típico:
- View consome hooks (ex.: `use-mobile.tsx`, `use-toast.ts`) e componentes.
- Adoção de contextos leves (Theme, Toast) já presente via componentes.

## UI/Design System
- Base em Tailwind + shadcn/ui.
- Componentes já disponíveis: `accordion`, `dialog`, `table`, `tabs`, `button`, etc.
- Padrões:
  - Estilos via classes Tailwind e tokens do tema em `tailwind.config.ts`.
  - Acessibilidade herdada do Radix (focus, aria).
  - Theming com `ThemeToggle.tsx` e potencial classe `dark` no `html/body`.

## Layout e Navegação
- `Sidebar.tsx`, `MobileTopBar.tsx`, `NavLink.tsx`: compõem layout responsivo.
- `KPICard.tsx`, `DateFilter.tsx`: widgets de domínio (indicadores, filtros).
- `App.tsx` como shell: aplica layout, tema e renderiza `views/*` ou `pages/*`.

## Convenções de Código
- TypeScript estrito nas `views` e `components`.
- Preferir componentes funcionais com hooks.
- Pastas em PascalCase para Views e camelCase para hooks/utilitários.
- Importações absolutas podem ser configuradas em `tsconfig.json` (paths) se necessário.

## Build e Deploy
- Desenvolvimento: `npm run dev` (Vite).
- Build: `vite build` via `npm run build`.
- Deploy: servir `dist/` em CDN/host estático. Integrar com CI/CD (GitHub Actions) conforme necessidade.

## Observabilidade e Qualidade
- Lint: `eslint.config.js`.
- Testes: não há configuração explícita listada (Vitest/Jest). Recomendação:
  - Adicionar Vitest para testes de hooks e componentes.
  - Testes de UI com Playwright conforme criticidade.
- Logs: preferir camadas de `lib/logger` ou uso de `console` com limites.

## Integrações e Dados Externos
- Não há endpoints/API configurados no contexto atual.
- Padrão sugerido:
  - `src/services/` para clientes HTTP (fetch/axios) com tipagem.
  - `src/models/` para tipos de domínio (DTOs, entidades).
  - `src/store/` para estado global (Zustand) quando necessário.

## Segurança e Performance
- Segurança: sanitização de entradas nos componentes, evitar `dangerouslySetInnerHTML`.
- Performance: lazy-load de rotas/views, memoização em listas/tabelas, `useMemo`, `useCallback`.
- Acessibilidade: usar componentes Radix/shadcn e atributos ARIA adequados.

## Roadmap de Evolução
1. Roteamento explícito
   - Adicionar `react-router-dom` e mapear `pages` -> `views`.
2. Estado global leve
   - Adotar Zustand para tema/filtros e composição de layout.
3. Dados remotos
   - Adotar React Query e `services/` para chamadas à API.
4. Testes
   - Vitest + Testing Library básica.
5. Tipos de domínio
   - `models/` com tipos, validadores (Zod) quando útil.

## Critérios: Reaproveitar vs Recomeçar
Use estes critérios para decidir:

### Adaptar a base atual (quando faz sentido)
- A estrutura `src/` já reflete o domínio (views: Dashboard, Equity, Governança, Maturidade, Valor Invisível).
- Componentes de UI e layout estão prontos e integrados com Tailwind/shadcn.
- Não há dívidas estruturais graves; faltam apenas camadas de roteamento/estado/dados.
- O esforço de adicionar router, estado e serviços é incremental e baixo risco.

### Começar do zero (quando faz sentido)
- Se houver dependências conflitantes ou decisões de base incompatíveis (ex.: necessidade de Next.js para SSR/SEO forte).
- Se a organização quer mudar radicalmente a arquitetura (monorepo, microfrontends, design system independente).
- Se o histórico/estrado atual contém dívidas significativas que inviabilizam manutenção.

### Sinalizadores práticos
- A presença robusta de `components/ui/` e `views/` indica boa base para evoluir.
- Ausência de router/estado/dados não é impeditiva; são camadas fáceis de adicionar.

## Proposta de Arquitetura Alvo (evolutiva)
- Front-end SPA com React + Vite + TypeScript.
- Roteamento com `react-router-dom` (lazy + code splitting).
- Estado global leve com Zustand; dados remotos com React Query.
- UI com shadcn/ui + Tailwind, tokens em `tailwind.config.ts`.
- Estrutura sugerida:
```
src/
  app/                 # setup de app (providers, router)
  pages/               # rotas/entry pages
  views/               # telas de domínio
  components/
    ui/                # design system
    domain/            # componentes de negócio
  hooks/
  lib/
  services/            # HTTP clients
  models/              # tipos de domínio
  store/               # estado global (Zustand)
```

## Próximos Passos
- Confirmar se há `react-router-dom` e adicionar caso não exista.
- Definir providers em `src/app/AppProviders.tsx` (Theme, QueryClient, Toast).
- Mapear rotas: `pages -> views` com lazy.
- Introduzir `services/` e `models/` conforme back-end.
- Configurar Vitest.

---

Se quiser, posso já criar os arquivos-base (router, providers, store) e integrar no `App.tsx` para acelerar a avaliação com a sua IA e o time.