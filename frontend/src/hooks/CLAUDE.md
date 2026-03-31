# Hooks

## Padrão MVVM
Cada view complexa tem um `use*ViewModel.ts` que encapsula toda a lógica:
- Estado local (useState, useEffect)
- Chamadas a services
- Validação e transformação de dados
- A view só consome o retorno do hook

## ViewModels Ativos
- `useLoginViewModel` — login email/password, detecção first-login, redirect
- `useSignUpViewModel` — cadastro com validação (password, phone, CNPJ)
- `useSurveyAssessment` — questionário paginado, auto-save (debounce 1.5s), progresso
- `useFinancialData` — dashboard financeiro, DashboardState enum (LOADING|NO_UPLOAD|EMPTY_PERIOD|HAS_DATA), filtros por período global e individual
- `usePendingDocumentsViewModel` — lista de documentos pendentes
- `usePendingDocumentDetailViewModel` — detalhe com ações (map, validate, approve/reject)
- `useMyPendingDocumentsViewModel` — documentos do usuário logado
- `useMyPendingDocumentDetailViewModel` — detalhe do documento do usuário

## Naming
`use` + NomeDaView + `ViewModel.ts`. Testes co-localizados como `.spec.ts` ou `.test.ts`.
