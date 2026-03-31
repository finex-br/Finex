# Views

Cada view usa um ViewModel hook para lógica. A view é puramente presentacional.

## Por Domínio

### Auth
- `LoginView` → useLoginViewModel
- `SignUpView` → useSignUpViewModel

### Company
- `CompanySetupView` — seleção/criação de empresa (multi-tenant)

### Dashboard
- `DashboardView` — KPIs, gráficos financeiros, filtros de período

### Financial (Documents)
- `UploadView` — upload inicial (onboarding)
- `MyDocumentsView` / `MyDocumentDetailView` — documentos do usuário
- `PendingDocumentsAdminView` / `PendingDocumentAdminDetailView` — fila admin

### Survey
- `SurveysListView` — surveys pendentes do usuário
- `SurveyQuestionnaireView` → useSurveyAssessment (1 pergunta/página, auto-save)
- `SurveyResponsesView` — respostas de assessment completado

### Admin
- `AdminPanelView` — painel administrativo

### Static
- `LandingView`, `PrivacyView`, `TermsView`

### OAuth (desabilitado)
- `GoogleCallbackView` — callback OAuth (inativo)
