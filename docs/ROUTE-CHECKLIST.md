# Route Checklist (Backend)

Generated: 2026-01-19

## Conventions

- **Auth**
  - “JWT” means the route is protected by `JwtAuthGuard`.
  - “ADMIN” means system admin (`req.user.role === 'ADMIN'`).
- **Tenant selection (`X-Company-Id`)**
  - For routes using `resolveCompanyContext(..., { requireCompanyIdForAdmin: true })`:
    - **ADMIN** must send `X-Company-Id`.
    - Non-admin users:
      - If user has exactly 1 active membership → company auto-selected.
      - If user has >1 active membership → must send `X-Company-Id`.
  - For routes using `resolveCompanyContext(..., { allowAllCompaniesForAdmin: true })`:
    - **ADMIN** may omit `X-Company-Id` to act “cross-company” (companyId = undefined).

---

## Health

- `GET /health`
  - Auth: No
  - Tenant: N/A
  - Notes: Liveness

## Authentication

### AuthController

- `POST /auth/sign-up`
  - Auth: No
  - Tenant: N/A
- `POST /auth/sign-in`
  - Auth: No
  - Tenant: N/A

### OAuthController

- `POST /auth/oauth/:provider/callback`
  - Auth: No
  - Tenant: N/A
- `GET /auth/oauth/:provider/callback`
  - Auth: No
  - Tenant: N/A

### SocialAccountController

- `POST /auth/social-account/link`
  - Auth: JWT
  - Tenant: N/A
- `DELETE /auth/social-account/unlink`
  - Auth: JWT
  - Tenant: N/A

## Companies

### CompanyController

- `GET /companies`
  - Auth: JWT
  - Tenant: N/A
  - Notes: Lists all active company memberships for the authenticated user.

- `GET /companies/me`
  - Auth: JWT
  - Tenant: Optional `X-Company-Id` **only to disambiguate**
  - Notes:
    - 0 memberships → `company: null`
    - 1 membership → returns it
    - >1 memberships → **400** unless `X-Company-Id` is provided

- `POST /companies`
  - Auth: JWT
  - Tenant: N/A
  - Notes: Currently blocks creating a company if the user already has any active company membership.

## Financial

### FinancialController

- `POST /financial/upload` (desativado — usar `/financial/pending-documents/upload` + aprovação ADMIN)
  - Auth: JWT
  - Tenant: Uses `X-Company-Id` + `resolveCompanyContext(requireCompanyIdForAdmin: true)`
  - Notes: Header required for ADMIN and multi-company users.

- `GET /financial/data`
  - Auth: JWT
  - Tenant: Uses `X-Company-Id` + `resolveCompanyContext(requireCompanyIdForAdmin: true)`
  - Notes: Header required for ADMIN and multi-company users.

### PendingDocumentController

- `POST /financial/pending-documents/upload`
  - Auth: JWT
  - Tenant: **Requires** `X-Company-Id` (explicitly enforced)

- `GET /financial/pending-documents`
  - Auth: JWT
  - Tenant:
    - ADMIN: may omit `X-Company-Id` to list all companies
    - Non-admin: company resolved via membership; header required only if user has >1 company

- `GET /financial/pending-documents/:id`
  - Auth: JWT
  - Tenant:
    - ADMIN: cross-company access allowed
    - Non-admin: must match document.companyId

- `POST /financial/pending-documents/:id/map`
  - Auth: JWT
  - Tenant:
    - ADMIN: cross-company allowed
    - Non-admin: must match document.companyId; header required only if user has >1 company

- `POST /financial/pending-documents/:id/validate`
  - Auth: JWT
  - Tenant:
    - ADMIN: cross-company allowed
    - Non-admin: must match document.companyId; header required only if user has >1 company

- `POST /financial/pending-documents/:id/overrides`
  - Auth: JWT
  - Tenant: N/A
  - Notes: ADMIN-only action.

- `POST /financial/pending-documents/:id/exclusions`
  - Auth: JWT
  - Tenant: N/A
  - Notes: ADMIN-only action.

- `POST /financial/pending-documents/:id/approve`
  - Auth: JWT
  - Tenant: N/A
  - Notes: ADMIN-only action.

- `POST /financial/pending-documents/:id/reject`
  - Auth: JWT
  - Tenant: N/A
  - Notes: ADMIN-only action.

## Surveys

### UserSurveyController

- `GET /surveys/pending`
  - Auth: JWT
  - Tenant: Uses `X-Company-Id` + `resolveCompanyContext(requireCompanyIdForAdmin: true)`

- `POST /surveys/:surveyId/start`
  - Auth: JWT
  - Tenant: Uses `X-Company-Id` + `resolveCompanyContext(requireCompanyIdForAdmin: true)`

- `GET /surveys/assessments/:assessmentId/questions?page=...`
  - Auth: JWT
  - Tenant: Uses `X-Company-Id` + `resolveCompanyContext(requireCompanyIdForAdmin: true)`

- `POST /surveys/assessments/:assessmentId/answers`
  - Auth: JWT
  - Tenant: Uses `X-Company-Id` + `resolveCompanyContext(requireCompanyIdForAdmin: true)`

- `POST /surveys/assessments/:assessmentId/complete`
  - Auth: JWT
  - Tenant: Uses `X-Company-Id` + `resolveCompanyContext(requireCompanyIdForAdmin: true)`

- `GET /surveys/assessments/:assessmentId/progress`
  - Auth: JWT
  - Tenant: N/A
  - Notes: Not implemented (throws error).

### AdminSurveyController

All routes below:
- Auth: JWT + AdminGuard
- Tenant: N/A (admin templates)

- `POST /admin/surveys`
- `POST /admin/surveys/versions`
- `POST /admin/surveys/versions/:surveyVersionId/questions`

Not implemented (throws error):
- `PATCH /admin/surveys/:id/activate`
- `PATCH /admin/surveys/:id/deactivate`
- `GET /admin/surveys`
- `GET /admin/surveys/:id`

## Payments

### PaymentController

- `POST /payment/checkout`
  - Auth: JWT
  - Tenant: Uses `X-Company-Id` + `resolveCompanyContext(requireCompanyIdForAdmin: true)`
  - Notes: Currently resolves company context but the `CreateCheckoutUseCase` does not accept/persist `companyId` (schema drift risk vs DB).

- `GET /payment/checkout/:id`
  - Auth: JWT
  - Tenant: N/A
  - Notes: Not implemented (throws error).

### AsaasWebhookController

- `POST /webhooks/asaas/payment`
  - Auth: No
  - Tenant: N/A
  - Notes: Intended to be called by payment provider; signature validation is TODO.

---

## Known Drift / Risks to Track

- **Payments schema drift**: `backend/scripts/init-database.sql` defines `checkouts` with Stripe-ish columns (`stripe_session_id`, `currency`, etc.) but the code is implementing Asaas flow and doesn’t model `companyId` on checkout.
- **Company selection ambiguity**: `GET /companies/me` returns the *first* membership, which may conflict with “explicit tenant switch” expectations when a user has multiple companies.
