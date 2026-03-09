# Metabase JWT Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Metabase dashboards into Finex using signed JWT tokens, so admins enter a Metabase dashboard ID and clients see the live dashboard rendered via Metabase's Embedding SDK — securely, without URL expiry problems.

**Architecture:** Admin stores a Metabase dashboard ID (integer) on each Finex Dashboard record. When a client opens the dashboard, the Finex backend signs a short-lived Metabase JWT using the Metabase embedding secret key and returns it to the frontend. The frontend loads Metabase's `embed.js` and renders the `<metabase-dashboard>` web component with the fresh token.

**Tech Stack:** NestJS (backend, Clean Architecture), `@nestjs/jwt` (JWT signing), TypeORM (PostgreSQL), React + Vite (frontend), Metabase Embedding SDK (web component).

---

## Context & Decisions

- **`metabaseDashboardId`** (integer) is added as a new field alongside the existing `embedHtml`. The `embedHtml` field is kept in the database but the admin UI will no longer expose it — the new Metabase flow replaces it.
- **JWT signing:** We reuse `@nestjs/jwt`'s `JwtService.sign()` with `{ secret: metabaseSecretKey, algorithm: 'HS256' }` overrides — no new package needed.
- **Token expiry:** 1 hour (`3600` seconds). The frontend refetches the token if it expires (on remount / page refresh).
- **No `company_id` filter in token for now:** The Metabase dashboard shows all data the admin configured. Per-company filtering can be added later by locking a `company_id` parameter in the token payload.
- **Metabase embedding secret key:** Stored as `METABASE_SECRET_KEY` env var in the backend `.env`.
- **Metabase site URL:** Stored as `METABASE_SITE_URL` env var (e.g. `http://dados-finex.astraflow.io`).

---

## Critical Files

| Layer | File |
|-------|------|
| Domain entity | `backend/src/modules/analytics/domain/entities/dashboard.ts` |
| TypeORM schema | `backend/src/modules/analytics/infrastructure/persistence/typeorm/dashboard.schema.ts` |
| Repository | `backend/src/modules/analytics/infrastructure/persistence/typeorm/typeorm-dashboard.repository.ts` |
| DTOs | `backend/src/modules/analytics/application/dtos/dashboard.dto.ts` |
| Create use-case | `backend/src/modules/analytics/application/use-cases/create-dashboard.use-case.ts` |
| Update use-case | `backend/src/modules/analytics/application/use-cases/update-dashboard.use-case.ts` |
| New use-case | `backend/src/modules/analytics/application/use-cases/generate-metabase-embed-token.use-case.ts` |
| Controller | `backend/src/modules/analytics/presentation/controllers/dashboard.controller.ts` |
| Module | `backend/src/modules/analytics/analytics.module.ts` |
| EnvService | `backend/src/shared/infra/env/env.service.ts` |
| Env example | `backend/.env.example` |
| Frontend service | `frontend/src/services/dashboardService.ts` |
| Embed component | `frontend/src/components/dashboard/MetabaseEmbed.tsx` |
| Renderer | `frontend/src/components/dashboard/DynamicDashboardRenderer.tsx` |
| Admin config view | `frontend/src/views/admin/DashboardConfigView.tsx` |
| Admin config hook | `frontend/src/hooks/useDashboardConfig.ts` |
| Dashboard view | `frontend/src/views/DynamicDashboardView.tsx` |

---

## Task 1: Add env vars to EnvService

**Files:**
- Modify: `backend/src/shared/infra/env/env.service.ts`
- Modify: `backend/.env.example`

**Step 1: Add getters to EnvService**

At the bottom of `env.service.ts`, add:

```typescript
get metabaseSecretKey(): string {
  return this.get('METABASE_SECRET_KEY');
}

get metabaseSiteUrl(): string {
  return this.get('METABASE_SITE_URL');
}
```

**Step 2: Add to .env.example**

```
METABASE_SECRET_KEY=your_metabase_embedding_secret_here
METABASE_SITE_URL=http://dados-finex.astraflow.io
```

**Step 3: Add to your own .env file (not committed)**

```
METABASE_SECRET_KEY=<paste the secret from Metabase Admin → Settings → Embedding>
METABASE_SITE_URL=http://dados-finex.astraflow.io
```

**Step 4: Commit**

```bash
git add backend/src/shared/infra/env/env.service.ts backend/.env.example
git commit -m "feat: add Metabase env vars to EnvService"
```

---

## Task 2: Add `metabaseDashboardId` to Domain Entity

**Files:**
- Modify: `backend/src/modules/analytics/domain/entities/dashboard.ts`

**Step 1: Update `DashboardProps` interface**

```typescript
interface DashboardProps {
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  embedHtml?: string;
  metabaseDashboardId?: number;   // ADD THIS
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Step 2: Add getter**

After `get embedHtml()`:
```typescript
get metabaseDashboardId(): number | undefined { return this.props.metabaseDashboardId; }
```

**Step 3: Update `update()` method**

```typescript
public update(data: {
  name?: string;
  description?: string;
  isDefault?: boolean;
  embedHtml?: string | null;
  metabaseDashboardId?: number | null;  // ADD THIS
}): void {
  if (data.name !== undefined) this.props.name = data.name;
  if (data.description !== undefined) this.props.description = data.description;
  if (data.isDefault !== undefined) this.props.isDefault = data.isDefault;
  if (data.embedHtml !== undefined) {
    this.props.embedHtml = data.embedHtml === null ? undefined : data.embedHtml;
  }
  if (data.metabaseDashboardId !== undefined) {  // ADD THIS BLOCK
    this.props.metabaseDashboardId = data.metabaseDashboardId === null
      ? undefined
      : data.metabaseDashboardId;
  }
  this.props.updatedAt = new Date();
}
```

**Step 4: Commit**

```bash
git add backend/src/modules/analytics/domain/entities/dashboard.ts
git commit -m "feat: add metabaseDashboardId to Dashboard domain entity"
```

---

## Task 3: Update TypeORM Schema

**Files:**
- Modify: `backend/src/modules/analytics/infrastructure/persistence/typeorm/dashboard.schema.ts`

**Step 1: Add new column**

After the `embedHtml` column:
```typescript
@Column({ name: 'metabase_dashboard_id', type: 'integer', nullable: true })
metabaseDashboardId: number | null;
```

**Step 2: Restart dev server to apply migration**

TypeORM with `synchronize: true` in dev will add the column automatically.

If running without synchronize, generate a migration:
```bash
cd backend && npm run typeorm migration:generate -- -n AddMetabaseDashboardId
npm run typeorm migration:run
```

**Step 3: Commit**

```bash
git add backend/src/modules/analytics/infrastructure/persistence/typeorm/dashboard.schema.ts
git commit -m "feat: add metabase_dashboard_id column to dashboards schema"
```

---

## Task 4: Update Repository Mapper

**Files:**
- Modify: `backend/src/modules/analytics/infrastructure/persistence/typeorm/typeorm-dashboard.repository.ts`

**Step 1: Update `toSchema()`**

After `schema.embedHtml = ...`:
```typescript
schema.metabaseDashboardId = dashboard.metabaseDashboardId ?? null;
```

**Step 2: Update `toDomain()`**

Add inside the `Dashboard.create()` props:
```typescript
metabaseDashboardId: schema.metabaseDashboardId ?? undefined,
```

**Step 3: Commit**

```bash
git add backend/src/modules/analytics/infrastructure/persistence/typeorm/typeorm-dashboard.repository.ts
git commit -m "feat: map metabaseDashboardId in repository"
```

---

## Task 5: Update DTOs

**Files:**
- Modify: `backend/src/modules/analytics/application/dtos/dashboard.dto.ts`

**Step 1: Add field to all relevant DTOs**

Add `metabaseDashboardId?: number;` to:
- `CreateDashboardRequestDTO`
- `UpdateDashboardRequestDTO`
- `DashboardResponseDTO`
- `DashboardWithChartsResponseDTO`
- `DashboardWithDataResponseDTO`

**Step 2: Add token DTO (new, at bottom of file)**

```typescript
// ===== Metabase Embed Token =====

export interface MetabaseEmbedTokenResponseDTO {
  token: string;
  siteUrl: string;
}
```

**Step 3: Commit**

```bash
git add backend/src/modules/analytics/application/dtos/dashboard.dto.ts
git commit -m "feat: add metabaseDashboardId and MetabaseEmbedTokenResponseDTO to DTOs"
```

---

## Task 6: Update Create & Update Use-Cases

**Files:**
- Modify: `backend/src/modules/analytics/application/use-cases/create-dashboard.use-case.ts`
- Modify: `backend/src/modules/analytics/application/use-cases/update-dashboard.use-case.ts`

**Step 1: Update `create-dashboard.use-case.ts`**

In `Dashboard.create(...)`, add:
```typescript
metabaseDashboardId: request.metabaseDashboardId,
```

In the returned DTO, add:
```typescript
metabaseDashboardId: dashboard.metabaseDashboardId,
```

**Step 2: Update `update-dashboard.use-case.ts`**

In `dashboard.update(...)`, add:
```typescript
metabaseDashboardId: request.metabaseDashboardId !== undefined
  ? (request.metabaseDashboardId ?? null)
  : undefined,
```

In the returned DTO, add:
```typescript
metabaseDashboardId: dashboard.metabaseDashboardId,
```

**Step 3: Commit**

```bash
git add backend/src/modules/analytics/application/use-cases/create-dashboard.use-case.ts \
        backend/src/modules/analytics/application/use-cases/update-dashboard.use-case.ts
git commit -m "feat: propagate metabaseDashboardId through create/update use-cases"
```

---

## Task 7: Create `GenerateMetabaseEmbedTokenUseCase`

**Files:**
- Create: `backend/src/modules/analytics/application/use-cases/generate-metabase-embed-token.use-case.ts`

**Step 1: Create the file**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDashboardRepository } from '../../domain/ports/dashboard-repository.interface';
import { MetabaseEmbedTokenResponseDTO } from '../dtos/dashboard.dto';
import { EnvService } from '../../../../shared/infra/env/env.service';

interface GenerateMetabaseEmbedTokenRequest {
  dashboardId: string;
  companyId: string;
}

@Injectable()
export class GenerateMetabaseEmbedTokenUseCase
  implements IUseCase<GenerateMetabaseEmbedTokenRequest, MetabaseEmbedTokenResponseDTO>
{
  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepo: IDashboardRepository,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}

  async execute(
    request: GenerateMetabaseEmbedTokenRequest,
  ): Promise<MetabaseEmbedTokenResponseDTO> {
    const dashboard = await this.dashboardRepo.findById(request.dashboardId);

    if (!dashboard) {
      throw new Error(`Dashboard not found: ${request.dashboardId}`);
    }

    if (dashboard.companyId !== request.companyId) {
      throw new Error('Unauthorized: dashboard does not belong to this company');
    }

    if (!dashboard.metabaseDashboardId) {
      throw new Error('This dashboard does not have a Metabase dashboard configured');
    }

    const secretKey = this.envService.metabaseSecretKey;
    const siteUrl = this.envService.metabaseSiteUrl;

    if (!secretKey) {
      throw new Error('METABASE_SECRET_KEY is not configured');
    }

    const payload = {
      resource: { dashboard: dashboard.metabaseDashboardId },
      params: {},
      exp: Math.round(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    const token = this.jwtService.sign(payload, {
      secret: secretKey,
      algorithm: 'HS256',
    });

    return { token, siteUrl };
  }
}
```

**Step 2: Commit**

```bash
git add backend/src/modules/analytics/application/use-cases/generate-metabase-embed-token.use-case.ts
git commit -m "feat: add GenerateMetabaseEmbedTokenUseCase"
```

---

## Task 8: Update Dashboard Controller

**Files:**
- Modify: `backend/src/modules/analytics/presentation/controllers/dashboard.controller.ts`

**Step 1: Add new use-case import and inject**

```typescript
import { GenerateMetabaseEmbedTokenUseCase } from '../../application/use-cases/generate-metabase-embed-token.use-case';
```

Add to constructor:
```typescript
private readonly generateMetabaseEmbedTokenUseCase: GenerateMetabaseEmbedTokenUseCase,
```

**Step 2: Pass `metabaseDashboardId` in create/update**

In `create()`, add to the use-case call:
```typescript
metabaseDashboardId: body.metabaseDashboardId
  ? Number(body.metabaseDashboardId)
  : undefined,
```

In `update()`, add:
```typescript
metabaseDashboardId: body.metabaseDashboardId !== undefined
  ? (body.metabaseDashboardId ? Number(body.metabaseDashboardId) : null)
  : undefined,
```

**Step 3: Add `metabase_dashboard_id` to the raw SQL in `list()`**

The `list()` method uses raw SQL. Update the query:
```typescript
SELECT id, company_id as "companyId", name, description,
       is_default as "isDefault", created_by as "createdBy",
       embed_html as "embedHtml",
       metabase_dashboard_id as "metabaseDashboardId",
       created_at as "createdAt", updated_at as "updatedAt"
FROM dashboards
WHERE company_id = $1
ORDER BY created_at DESC
```

**Step 4: Add new endpoint**

```typescript
@Get(':id/metabase-token')
async getMetabaseToken(
  @Param('id') id: string,
  @Query('companyId') companyId: string,
  @Request() req: any,
) {
  try {
    const ctx = await resolveCompanyContext(this.dataSource, req, companyId, {
      requireCompanyIdForAdmin: true,
    });
    const result = await this.generateMetabaseEmbedTokenUseCase.execute({
      dashboardId: id,
      companyId: ctx.companyId!,
    });
    return { success: true, ...result };
  } catch (error: any) {
    throw new HttpException(
      error.message || 'Failed to generate Metabase token',
      error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
```

**Step 5: Commit**

```bash
git add backend/src/modules/analytics/presentation/controllers/dashboard.controller.ts
git commit -m "feat: add metabase-token endpoint and metabaseDashboardId to dashboard controller"
```

---

## Task 9: Register New Use-Case in Analytics Module

**Files:**
- Modify: `backend/src/modules/analytics/analytics.module.ts`

**Step 1: Import the new use-case**

```typescript
import { GenerateMetabaseEmbedTokenUseCase } from './application/use-cases/generate-metabase-embed-token.use-case';
```

**Step 2: Register as a provider**

Inside the `providers` array, add:
```typescript
{
  provide: GenerateMetabaseEmbedTokenUseCase,
  useFactory: (dashboardRepo, jwtService, envService) => {
    return new GenerateMetabaseEmbedTokenUseCase(dashboardRepo, jwtService, envService);
  },
  inject: ['IDashboardRepository', JwtService, EnvService],
},
```

**Step 3: Add to controller's dependencies**

The `DashboardController` is declared directly in the `controllers` array and resolves from providers automatically — no factory change needed since NestJS will inject it.

Wait — looking at the module, `DashboardController` is in `controllers: [DashboardController]` directly, so NestJS resolves its constructor args from the providers. Add `GenerateMetabaseEmbedTokenUseCase` to providers and it will be injected automatically.

**Step 4: Commit**

```bash
git add backend/src/modules/analytics/analytics.module.ts
git commit -m "feat: register GenerateMetabaseEmbedTokenUseCase in analytics module"
```

---

## Task 10: Backend Smoke Test

Run the backend and verify:

```bash
cd backend && npm run start:dev
```

Expected: Server starts without errors.

Test endpoint manually (replace IDs and token):
```bash
curl -X GET "http://localhost:3000/analytics/dashboards/{finex-dashboard-id}/metabase-token?companyId={company-id}" \
  -H "Authorization: Bearer {your-finex-jwt}"
```

Expected response:
```json
{"success": true, "token": "eyJ...", "siteUrl": "http://dados-finex.astraflow.io"}
```

---

## Task 11: Update Frontend `dashboardService.ts`

**Files:**
- Modify: `frontend/src/services/dashboardService.ts`

**Step 1: Add `metabaseDashboardId` to the `Dashboard` interface**

```typescript
export interface Dashboard {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  embedHtml?: string;
  metabaseDashboardId?: number;  // ADD THIS
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

Also add it to `DashboardWithData` / `DashboardWithCharts` if those interfaces are defined separately.

**Step 2: Add `metabaseDashboardId` to create/update methods**

Update the `create()` and `update()` method parameter types to accept:
```typescript
metabaseDashboardId?: number;
```

**Step 3: Add `getMetabaseToken()` method**

```typescript
async getMetabaseToken(
  dashboardId: string,
  companyId: string,
): Promise<{ token: string; siteUrl: string }> {
  const response = await api.get(
    `/analytics/dashboards/${dashboardId}/metabase-token`,
    { params: { companyId } },
  );
  return response.data;
}
```

**Step 4: Commit**

```bash
git add frontend/src/services/dashboardService.ts
git commit -m "feat: add metabaseDashboardId and getMetabaseToken to dashboardService"
```

---

## Task 12: Rewrite `MetabaseEmbed.tsx`

**Files:**
- Modify: `frontend/src/components/dashboard/MetabaseEmbed.tsx`

The current component extracts `src` from HTML. We rewrite it to use the JWT approach with the Metabase web component.

**Step 1: Add TypeScript type declaration for the custom element**

At the top of `MetabaseEmbed.tsx`, before the imports:

```typescript
declare global {
  interface Window {
    defineMetabaseConfig: (config: {
      theme?: { preset?: string };
      isGuest?: boolean;
      instanceUrl?: string;
    }) => void;
    metabaseConfig?: Record<string, unknown>;
  }
  namespace JSX {
    interface IntrinsicElements {
      'metabase-dashboard': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          token?: string;
          'with-title'?: string;
          'with-downloads'?: string;
        },
        HTMLElement
      >;
    }
  }
}
```

**Step 2: Write the new component**

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardService } from '@/services/dashboardService';

interface MetabaseEmbedProps {
  finexDashboardId: string;
  companyId: string;
}

export function MetabaseEmbed({
  finexDashboardId,
  companyId,
}: MetabaseEmbedProps): React.ReactElement {
  const [token, setToken] = useState<string | null>(null);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmbed() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await dashboardService.getMetabaseToken(
          finexDashboardId,
          companyId,
        );
        if (cancelled) return;

        setSiteUrl(result.siteUrl);
        setToken(result.token);

        // Load embed.js from the Metabase instance (once only)
        const scriptId = 'metabase-embed-js';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `${result.siteUrl}/app/embed.js`;
          script.defer = true;
          document.head.appendChild(script);
          scriptRef.current = script;
        }

        // Configure the Metabase SDK
        window.defineMetabaseConfig = (config) => {
          window.metabaseConfig = config as Record<string, unknown>;
        };
        window.defineMetabaseConfig({
          theme: { preset: 'light' },
          isGuest: true,
          instanceUrl: result.siteUrl,
        });
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar dashboard');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadEmbed();
    return () => { cancelled = true; };
  }, [finexDashboardId, companyId]);

  if (isLoading) {
    return (
      <Skeleton
        style={{ width: '100%', height: 'calc(100vh - 180px)', minHeight: 600 }}
        className="rounded-lg"
      />
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center gap-3 pt-6 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 180px)',
        minHeight: 600,
      }}
    >
      <metabase-dashboard
        token={token ?? ''}
        with-title="false"
        with-downloads="true"
        style={{ display: 'block', width: '100%', height: '100%' } as React.CSSProperties}
      />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add frontend/src/components/dashboard/MetabaseEmbed.tsx
git commit -m "feat: rewrite MetabaseEmbed to use Metabase Embedding SDK with JWT"
```

---

## Task 13: Update `DynamicDashboardRenderer.tsx`

**Files:**
- Modify: `frontend/src/components/dashboard/DynamicDashboardRenderer.tsx`

**Step 1: Update the `Dashboard` interface in the file**

Add `metabaseDashboardId?: number` to the local `Dashboard` interface (lines 38–44).

**Step 2: Update the `DynamicDashboardRendererProps` interface**

Add `companyId: string` to the props.

**Step 3: Update the embed section**

The current check is:
```tsx
{dashboard.embedHtml ? (
  <MetabaseEmbed html={dashboard.embedHtml} />
) : ...
```

Change to:
```tsx
{dashboard.metabaseDashboardId ? (
  <MetabaseEmbed
    finexDashboardId={dashboard.id}
    companyId={companyId}
  />
) : ...
```

**Step 4: Commit**

```bash
git add frontend/src/components/dashboard/DynamicDashboardRenderer.tsx
git commit -m "feat: update DynamicDashboardRenderer to use metabaseDashboardId"
```

---

## Task 14: Pass `companyId` Down from Views

**Files:**
- Modify: `frontend/src/views/DynamicDashboardView.tsx`
- Modify: `frontend/src/views/DashboardView.tsx` (if it renders DynamicDashboardRenderer)

**Step 1: In `DynamicDashboardView.tsx`**

The view already resolves `companyId` from URL params / localStorage. Find where it renders `DynamicDashboardRenderer` and add `companyId={companyId}`.

**Step 2: Check `DashboardView.tsx`**

If `DashboardView` renders `DynamicDashboardRenderer` directly, add `companyId` there too.

**Step 3: Commit**

```bash
git add frontend/src/views/DynamicDashboardView.tsx frontend/src/views/DashboardView.tsx
git commit -m "feat: pass companyId to DynamicDashboardRenderer"
```

---

## Task 15: Update Admin Config UI

**Files:**
- Modify: `frontend/src/views/admin/DashboardConfigView.tsx`
- Modify: `frontend/src/hooks/useDashboardConfig.ts`

### 15a — Update `useDashboardConfig.ts`

**Step 1:** Find the `updateDashboard()` function and add `metabaseDashboardId?: number | null` to its parameters and to the API call payload.

**Step 2:** Wherever `selectedDashboard` is set from API response, ensure `metabaseDashboardId` is mapped through.

### 15b — Update `DashboardConfigView.tsx`

**Step 1: Add state for the new field**

```typescript
const [editMetabaseDashboardId, setEditMetabaseDashboardId] = useState<string>('');
```

**Step 2: Sync with selectedDashboard**

In the `useEffect` that syncs the form (around line 80–86):
```typescript
setEditMetabaseDashboardId(
  selectedDashboard.metabaseDashboardId?.toString() || ''
);
```

**Step 3: Replace the old "Embed HTML" section in the dialog**

Replace the `<div className="space-y-2">` that contains the embed HTML textarea with:

```tsx
<div className="space-y-2">
  <Label htmlFor="edit-metabase-id">
    Metabase Dashboard ID
  </Label>
  <p className="text-xs text-muted-foreground">
    Cole o ID numérico do dashboard no Metabase (ex: o número ao final da URL{' '}
    <code>/dashboard/42</code> → ID é <code>42</code>).
  </p>
  <Input
    id="edit-metabase-id"
    type="number"
    placeholder="Ex: 42"
    value={editMetabaseDashboardId}
    onChange={(e) => setEditMetabaseDashboardId(e.target.value)}
  />
  {editMetabaseDashboardId && (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setEditMetabaseDashboardId('')}
    >
      Limpar
    </Button>
  )}
</div>
```

**Step 4: Update `handleEditSave()`**

```typescript
const result = await updateDashboard(dashboardId, companyId, {
  name: editName.trim(),
  description: editDescription.trim() || undefined,
  embedHtml: '',   // clear old embedHtml
  metabaseDashboardId: editMetabaseDashboardId
    ? Number(editMetabaseDashboardId)
    : null,
});
```

**Step 5: Update the badge in the header**

```tsx
{(selectedDashboard.embedHtml || selectedDashboard.metabaseDashboardId) && (
  <Badge variant="secondary" className="mt-2">
    <Code className="h-3 w-3 mr-1" />
    Metabase dashboard ID: {selectedDashboard.metabaseDashboardId}
  </Badge>
)}
```

**Step 6: Remove `showEmbedPreview` state** (no longer needed with the new flow).

**Step 7: Commit**

```bash
git add frontend/src/views/admin/DashboardConfigView.tsx \
        frontend/src/hooks/useDashboardConfig.ts
git commit -m "feat: update admin dashboard config UI to use metabaseDashboardId"
```

---

## Task 16: TypeScript Check

```bash
cd frontend && npx tsc --noEmit
cd ../backend && npm run type-check
```

Fix any errors before proceeding.

---

## Verification

### End-to-End Test Flow

**1. Backend env check:**
```bash
# Verify env vars are loaded
cd backend && npm run start:dev
# Check logs — should not throw "METABASE_SECRET_KEY is not configured"
```

**2. Admin flow:**
- Log in as admin in Finex
- Go to Admin → Dashboards → select a company → Edit a dashboard
- Enter a valid Metabase dashboard ID (e.g. `1`)
- Save
- Confirm the badge shows `Metabase dashboard ID: 1`

**3. Token generation:**
- Click "Visualizar Dashboard"
- Open browser DevTools → Network tab
- Confirm a request to `/analytics/dashboards/{id}/metabase-token` returns `{success: true, token: "eyJ...", siteUrl: "..."}`

**4. Client view:**
- Dashboard page loads
- Skeleton shows briefly while token is fetched and `embed.js` loads
- Metabase dashboard renders full-page inside Finex (no Metabase header/title)
- Finex navigation bar is still visible at the top

**5. Regression check:**
- Open a dashboard with no `metabaseDashboardId` → native Finex charts render normally

**6. Error check:**
- Set an invalid Metabase dashboard ID → error card shows with Portuguese message
- Ensure no raw JWT token or secret key is visible in the browser's HTML source

---

## Notes for Option A → Future Upgrades

When you want per-company data filtering:
1. Add a dashboard filter parameter in Metabase (e.g. `company_id`)
2. In `GenerateMetabaseEmbedTokenUseCase`, add to `params`:
   ```typescript
   params: { company_id: dashboard.companyId },
   ```
3. That's it — the token will lock the `company_id` filter, clients can only see their data.
