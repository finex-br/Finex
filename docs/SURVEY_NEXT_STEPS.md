# 🚀 Próximos Passos - Survey Module

## 📊 Status Atual: ~75% Backend Completo

### ✅ O que está funcionando:
- Domain Layer completo com 460+ testes
- Infrastructure completa (schemas, mappers, repositories)
- 7 use cases principais implementados
- Controllers com endpoints funcionais
- Sistema de paginação (5 perguntas/página)
- Auto-save de respostas
- Validação por tipo de pergunta
- Cálculo automático de progresso

---

## 🎯 Prioridade 1: Backend Essencial

### 1. Autenticação e Autorização
**Por que é prioridade**: Sem isso, qualquer usuário pode acessar qualquer endpoint

- [ ] **Criar Guards**
  - `AdminGuard`: Verifica se usuário tem role = 'ADMIN'
  - `OwnerGuard`: Verifica se usuário tem role = 'OWNER' e pertence à company
  - `AuthGuard`: Já existe no módulo de autenticação?

- [ ] **Aplicar Guards nos Controllers**
  ```typescript
  @UseGuards(AdminGuard)
  @Controller('admin/surveys')
  export class AdminSurveyController { }
  
  @UseGuards(OwnerGuard)
  @Controller('surveys')
  export class UserSurveyController { }
  ```

- [ ] **Adicionar coluna 'role' na tabela users**
  - Criar migration: `CREATE TYPE user_role AS ENUM ('ADMIN', 'OWNER', 'USER')`
  - Adicionar coluna: `ALTER TABLE users ADD COLUMN role user_role DEFAULT 'USER'`

**Tempo estimado**: 2-3 horas

---

### 2. Completar Use Cases Faltantes
**Por que é prioridade**: Faltam funcionalidades administrativas importantes

- [ ] **GetAllSurveysUseCase**
  - Listar todos os surveys (com filtro de ativos/inativos)
  - Incluir contagem de assessments por survey
  - Paginação

- [ ] **GetSurveyDetailsUseCase**
  - Retornar survey com todas as versões
  - Incluir perguntas da versão ativa
  - Estatísticas de assessments

- [ ] **UpdateSurveyUseCase**
  - Atualizar título e descrição
  - Ativar/desativar survey
  - Não permitir se houver assessments IN_PROGRESS

**Tempo estimado**: 3-4 horas

---

### 3. File Upload Integration
**Por que é prioridade**: Tipo de pergunta FILE_UPLOAD precisa funcionar

- [ ] **Criar FileUploadService**
  - Integrar com módulo de financial_uploads existente
  - Validar tipos de arquivo permitidos
  - Limitar tamanho máximo

- [ ] **Endpoint de Upload**
  ```typescript
  POST /api/surveys/assessments/:assessmentId/upload
  - Recebe multipart/form-data
  - Salva arquivo
  - Retorna fileId para usar na resposta
  ```

- [ ] **Vincular uploads ao assessment**
  - Adicionar coluna assessment_id em financial_uploads
  - Permitir exclusão de arquivos antes de completar

**Tempo estimado**: 2-3 horas

---

## 🎯 Prioridade 2: Testing

### 1. Testes de Integração
- [ ] Testar fluxo completo: criar survey → criar versão → responder → completar
- [ ] Testar paginação de perguntas
- [ ] Testar validação de cada tipo de resposta
- [ ] Testar retomada de assessment

### 2. Testes de Use Cases
- [ ] StartAssessmentUseCase
- [ ] GetQuestionsUseCase
- [ ] SubmitAnswersUseCase
- [ ] CompleteAssessmentUseCase
- [ ] GetPendingAssessmentsUseCase
- [ ] CreateSurveyVersionUseCase

**Tempo estimado**: 4-5 horas

---

## 🎯 Prioridade 3: Frontend

### 1. Estrutura Base
- [ ] **Criar tipos TypeScript**
  ```typescript
  // src/types/survey.types.ts
  export interface Survey { }
  export interface Question { }
  export interface Assessment { }
  export interface Answer { }
  ```

### 2. Serviços
- [ ] **SurveyService**
  ```typescript
  // src/services/surveyService.ts
  - getPendingSurveys(companyId)
  - startAssessment(surveyId, companyId)
  - getQuestions(assessmentId, page)
  - submitAnswers(assessmentId, answers)
  - completeAssessment(assessmentId)
  - uploadFile(assessmentId, file)
  ```

### 3. Hooks Customizados
- [ ] **useSurveys**: Gerencia lista de surveys pendentes
- [ ] **useAssessment**: Gerencia estado do assessment atual
- [ ] **useQuestions**: Gerencia paginação de perguntas
- [ ] **useAnswers**: Gerencia respostas e auto-save

### 4. Componentes

#### Componentes de Input por Tipo
- [ ] **DropdownQuestion**: Select com opções
- [ ] **TextQuestion**: Textarea
- [ ] **CNPJQuestion**: Input com máscara XX.XXX.XXX/XXXX-XX
- [ ] **NumberQuestion**: Input numérico
- [ ] **FileUploadQuestion**: Drag & drop de arquivos

#### Componentes de Layout
- [ ] **SurveyList**: Lista de surveys pendentes (card view)
- [ ] **QuestionnaireView**: Container principal do questionário
- [ ] **ProgressBar**: Barra de progresso visual
- [ ] **QuestionCard**: Card individual de pergunta
- [ ] **NavigationButtons**: Botões Anterior/Próxima/Salvar

### 5. Páginas
- [ ] **SurveysPage** (`/surveys`)
  - Lista surveys pendentes
  - Botão "Iniciar" ou "Continuar"
  
- [ ] **QuestionnairePage** (`/surveys/:assessmentId`)
  - Renderiza perguntas paginadas
  - Auto-save a cada resposta
  - Navegação entre páginas
  - Botão "Finalizar" quando 100%

**Tempo estimado**: 12-15 horas

---

## 🎯 Prioridade 4: Melhorias e Refinamentos

### Backend
- [ ] Adicionar soft delete para surveys
- [ ] Implementar cache para perguntas
- [ ] Adicionar logging de eventos importantes
- [ ] Criar seeds de exemplo para desenvolvimento
- [ ] Adicionar validação de datas de effectiveDate
- [ ] Implementar limite de tentativas por assessment

### Frontend
- [ ] Adicionar loading states
- [ ] Implementar error boundaries
- [ ] Adicionar toast notifications
- [ ] Implementar save indicator (auto-salvando...)
- [ ] Adicionar confirmação antes de sair (se houver alterações)
- [ ] Implementar versão mobile-friendly
- [ ] Adicionar animações de transição entre páginas

**Tempo estimado**: 8-10 horas

---

## 🎯 Prioridade 5: Documentação e Deploy

### Documentação
- [ ] Atualizar README principal do projeto
- [ ] Criar diagramas de fluxo (Mermaid)
- [ ] Documentar estrutura de banco de dados
- [ ] Adicionar comentários JSDoc nos use cases
- [ ] Criar guia de troubleshooting

### Deploy
- [ ] Configurar migrations do TypeORM para produção
- [ ] Criar scripts de seed para surveys iniciais
- [ ] Configurar variáveis de ambiente
- [ ] Testar em ambiente de staging
- [ ] Documentar processo de deploy

**Tempo estimado**: 4-5 horas

---

## 📅 Cronograma Sugerido

### Semana 1: Backend Essencial (20h)
- Dia 1-2: Guards e autenticação (4h)
- Dia 3: Use cases faltantes (4h)
- Dia 4: File upload (3h)
- Dia 5: Testes de integração (5h)
- Dia 6-7: Testes de use cases (4h)

### Semana 2: Frontend (25h)
- Dia 1: Estrutura base + serviços (5h)
- Dia 2: Hooks customizados (4h)
- Dia 3-4: Componentes de input (8h)
- Dia 5: Componentes de layout (4h)
- Dia 6-7: Páginas e integração (4h)

### Semana 3: Refinamento (15h)
- Dia 1-2: Melhorias backend (8h)
- Dia 3-4: Melhorias frontend (7h)

### Semana 4: Documentação e Deploy (10h)
- Dia 1-2: Documentação (5h)
- Dia 3-4: Deploy e testes finais (5h)

**Total Estimado**: 70 horas (~2 meses em tempo parcial)

---

## 🚨 Dependências Críticas

### Antes de continuar, precisa verificar:
1. **Módulo de Autenticação**
   - Existe AuthGuard implementado?
   - Como funciona o sistema de roles?
   - JWT está configurado?

2. **Módulo de Upload de Arquivos**
   - Existe serviço de upload?
   - Qual biblioteca está sendo usada? (Multer?)
   - Onde os arquivos são armazenados? (S3, local?)

3. **Tabela users**
   - Tem coluna 'role'?
   - Se não, precisa criar migration

4. **Relacionamento company_members**
   - Como verificar se user pertence a uma company?
   - Existe middleware ou guard para isso?

---

## 💡 Dicas de Implementação

### Backend
1. **Sempre use Result Pattern**: Retornar Result<T> dos use cases
2. **Validação em Camadas**: DTO → Use Case → Entity
3. **Testes Primeiro**: Escrever teste antes de implementar
4. **Nomes Descritivos**: Use nomes que explicam a intenção

### Frontend
1. **Separação de Concerns**: Lógica de negócio nos hooks, UI nos componentes
2. **Componentização**: Cada tipo de pergunta é um componente separado
3. **Estado Global**: Use Context API ou Zustand para estado do assessment
4. **Validação no Cliente**: Validar antes de enviar ao backend
5. **Feedback Imediato**: Loading, success, error states

---

## ✅ Checklist Final Antes de Produção

### Funcional
- [ ] Todos os use cases testados
- [ ] Todos os endpoints retornam responses corretos
- [ ] Validações funcionando
- [ ] File upload funcionando
- [ ] Paginação funcionando
- [ ] Progress tracking funcionando
- [ ] Auto-save funcionando

### Segurança
- [ ] Guards aplicados
- [ ] Validação de ownership (empresa pode acessar só seus assessments)
- [ ] Sanitização de inputs
- [ ] Rate limiting configurado

### Performance
- [ ] Índices no banco de dados
- [ ] Paginação em queries pesadas
- [ ] Cache implementado onde necessário

### UX
- [ ] Loading states
- [ ] Error handling
- [ ] Mensagens de sucesso
- [ ] Confirmações antes de ações destrutivas
- [ ] Mobile responsive

### DevOps
- [ ] Migrations testadas
- [ ] Seeds criados
- [ ] Logs configurados
- [ ] Monitoring configurado
- [ ] Backup strategy definida
