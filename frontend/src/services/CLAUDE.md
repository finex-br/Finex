# Services

## Instância Compartilhada
`api.ts` exporta instância Axios configurada com:
- Base URL: `VITE_API_URL` (default `http://localhost:3000`)
- Request interceptor: injeta Bearer token + header `x-company-id`
- Response interceptor: 401→clear auth + `/login`, 403→`/company/setup`

## Convenção
- Funções exportadas (não classes): `export const signIn = async (...)`
- Naming: `{domain}Service.ts`
- Todas importam a instância `api` de `./api`

## Services Ativos
| Arquivo | Domínio | Operações principais |
|---------|---------|---------------------|
| `authService.ts` | Auth | signIn, signUp |
| `companyService.ts` | Company | getMyCompany, listMyCompanies, createCompany |
| `surveyService.ts` | Survey | getPending, startAssessment, getQuestions (paginado), submitAnswers, complete |
| `financialService.ts` | Financial | uploadExcel, getFinancialData (com PeriodType filter) |
| `pendingDocumentsService.ts` | Documents | list, upload, mapColumns, validate, approve, reject, rowOverrides |
| `adminSurveyService.ts` | Admin | createSurvey, addQuestion, getAllSurveys, getCompletedAssessments |
| `oauthService.ts` | OAuth | desabilitado |
