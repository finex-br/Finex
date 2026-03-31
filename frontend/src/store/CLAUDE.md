# Store

## Zustand com Persist

Apenas `authStore.ts` atualmente. Preferir estado local em hooks/ViewModels.

### authStore
- **State**: `token`, `user`, `currentCompanyId`
- **Actions**: `setAuth(token, user)`, `setCurrentCompanyId(id)`, `clearAuth()`
- **Helper**: `isAuthenticated()` — verifica se token existe
- **Persist**: salva `token` e `user` no localStorage (não persiste companyId)
- Company ID salvo separadamente em `localStorage('current_company_id')`

## Quando Usar Store vs Hook
- Store: dados que precisam sobreviver a navegação entre páginas (auth)
- Hook/ViewModel: estado de UI, dados de formulário, dados fetch por página
