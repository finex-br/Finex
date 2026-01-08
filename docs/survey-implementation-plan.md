# Survey System - Plano de Implementação Completo

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
3. [Arquitetura Backend](#arquitetura-backend)
4. [Rotas da API](#rotas-da-api)
5. [Arquitetura Frontend](#arquitetura-frontend)
6. [Fluxo de Usuário](#fluxo-de-usuário)
7. [Regras de Negócio](#regras-de-negócio)
8. [Diretrizes de Desenvolvimento](#diretrizes-de-desenvolvimento)

---

## 🎯 Visão Geral

Sistema de questionários (surveys) para diagnóstico empresarial com:
- Criação e versionamento de questionários por admins
- Múltiplos tipos de perguntas (dropdown, texto, CNPJ, número, upload)
- Resposta paginada com salvamento automático
- Barra de progresso e retomada de onde parou
- Atribuição automática para todas empresas ativas

---

## 🗄️ Estrutura do Banco de Dados

### Novas Tabelas

```sql
-- Tabela principal de questionários
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL, -- Ex: "Diagnóstico 360"
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Versionamento de questionários
CREATE TABLE survey_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  effective_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(survey_id, version_number)
);

-- Perguntas do questionário
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_version_id UUID NOT NULL REFERENCES survey_versions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type VARCHAR NOT NULL, -- 'DROPDOWN', 'TEXT', 'CNPJ', 'NUMBER', 'FILE_UPLOAD'
  options JSONB, -- Apenas para DROPDOWN: ["Opção 1", "Opção 2", ...]
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Avaliações (respostas de uma empresa a um questionário)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  survey_version_id UUID NOT NULL REFERENCES survey_versions(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL, -- 'IN_PROGRESS', 'COMPLETED'
  final_score DECIMAL(5,2) DEFAULT 0, -- Percentual de conclusão (0-100)
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(company_id, survey_version_id) -- Uma empresa responde uma vez por versão
);

-- Respostas individuais
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value_json JSONB NOT NULL, -- Estrutura varia por tipo de pergunta
  comment TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(assessment_id, question_id) -- Uma resposta por pergunta por assessment
);

-- Índices para performance
CREATE INDEX idx_survey_versions_survey_id ON survey_versions(survey_id);
CREATE INDEX idx_questions_survey_version_id ON questions(survey_version_id);
CREATE INDEX idx_assessments_company_id ON assessments(company_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_answers_assessment_id ON answers(assessment_id);
```

### Tabelas Existentes (Contexto)

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'NORMAL', -- 'ADMIN' ou 'NORMAL'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Empresas
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  cnpj VARCHAR NOT NULL,
  sector VARCHAR,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Membros de empresa
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  role VARCHAR NOT NULL, -- 'OWNER', 'EMPLOYEE'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Assinaturas
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID UNIQUE NOT NULL REFERENCES companies(id),
  status VARCHAR NOT NULL, -- 'ACTIVE', 'BLOCKED'
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Uploads financeiros (usado para arquivos de questionário)
CREATE TABLE financial_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  filename VARCHAR NOT NULL,
  storage_path VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'DONE', -- 'PROCESSING', 'DONE', 'ERROR'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Estrutura do value_json por Tipo de Pergunta

```typescript
// DROPDOWN
{
  "selected": "Tecnologia"
}

// TEXT
{
  "text": "Minha resposta em texto livre"
}

// CNPJ
{
  "cnpj": "12.345.678/0001-90"
}

// NUMBER
{
  "number": 12345
}

// FILE_UPLOAD (array de IDs de financial_uploads)
{
  "fileIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

## 🏗️ Arquitetura Backend

### Estrutura de Diretórios

```
backend/src/modules/survey/
├── survey.module.ts
├── application/
│   ├── use-cases/
│   │   ├── create-survey/
│   │   │   ├── create-survey.use-case.ts
│   │   │   └── create-survey.use-case.spec.ts
│   │   ├── update-survey/
│   │   │   ├── update-survey.use-case.ts
│   │   │   └── update-survey.use-case.spec.ts
│   │   ├── create-survey-version/
│   │   │   ├── create-survey-version.use-case.ts
│   │   │   └── create-survey-version.use-case.spec.ts
│   │   ├── get-pending-assessments/
│   │   │   ├── get-pending-assessments.use-case.ts
│   │   │   └── get-pending-assessments.use-case.spec.ts
│   │   ├── start-assessment/
│   │   │   ├── start-assessment.use-case.ts
│   │   │   └── start-assessment.use-case.spec.ts
│   │   ├── submit-answers/
│   │   │   ├── submit-answers.use-case.ts
│   │   │   └── submit-answers.use-case.spec.ts
│   │   ├── complete-assessment/
│   │   │   ├── complete-assessment.use-case.ts
│   │   │   └── complete-assessment.use-case.spec.ts
│   │   ├── get-assessment-progress/
│   │   │   ├── get-assessment-progress.use-case.ts
│   │   │   └── get-assessment-progress.use-case.spec.ts
│   │   └── get-assessment-details/
│   │       ├── get-assessment-details.use-case.ts
│   │       └── get-assessment-details.use-case.spec.ts
├── domain/
│   ├── entities/
│   │   ├── survey.entity.ts
│   │   ├── survey.entity.spec.ts
│   │   ├── survey-version.entity.ts
│   │   ├── survey-version.entity.spec.ts
│   │   ├── question.entity.ts
│   │   ├── question.entity.spec.ts
│   │   ├── assessment.entity.ts
│   │   ├── assessment.entity.spec.ts
│   │   ├── answer.entity.ts
│   │   └── answer.entity.spec.ts
│   ├── value-objects/
│   │   ├── question-type.vo.ts
│   │   ├── question-type.vo.spec.ts
│   │   ├── assessment-status.vo.ts
│   │   ├── assessment-status.vo.spec.ts
│   │   ├── answer-value.vo.ts
│   │   ├── answer-value.vo.spec.ts
│   │   ├── dropdown-options.vo.ts
│   │   └── dropdown-options.vo.spec.ts
│   └── repositories/
│       ├── survey.repository.interface.ts
│       ├── survey-version.repository.interface.ts
│       ├── question.repository.interface.ts
│       ├── assessment.repository.interface.ts
│       └── answer.repository.interface.ts
├── infrastructure/
│   ├── database/
│   │   ├── repositories/
│   │   │   ├── typeorm-survey.repository.ts
│   │   │   ├── typeorm-survey.repository.spec.ts
│   │   │   ├── typeorm-survey-version.repository.ts
│   │   │   ├── typeorm-question.repository.ts
│   │   │   ├── typeorm-assessment.repository.ts
│   │   │   └── typeorm-answer.repository.ts
│   │   └── entities/
│   │       ├── survey.schema.ts
│   │       ├── survey-version.schema.ts
│   │       ├── question.schema.ts
│   │       ├── assessment.schema.ts
│   │       └── answer.schema.ts
└── presentation/
    ├── controllers/
    │   ├── admin-survey.controller.ts
    │   ├── admin-survey.controller.spec.ts
    │   ├── user-survey.controller.ts
    │   └── user-survey.controller.spec.ts
    └── dtos/
        ├── create-survey.dto.ts
        ├── update-survey.dto.ts
        ├── create-question.dto.ts
        ├── submit-answers.dto.ts
        └── assessment-response.dto.ts
```

### Entidades de Domínio Principais

#### Survey Entity
```typescript
export class Survey extends Entity<SurveyProps> {
  private constructor(props: SurveyProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get title(): string;
  get description(): string;
  get isActive(): boolean;
  
  activate(): Result<void>;
  deactivate(): Result<void>;
  updateInfo(title: string, description: string): Result<void>;
  
  static create(props: CreateSurveyProps, id?: UniqueEntityID): Result<Survey>;
}
```

#### Question Entity
```typescript
export class Question extends Entity<QuestionProps> {
  private constructor(props: QuestionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get surveyVersionId(): UniqueEntityID;
  get text(): string;
  get type(): QuestionType;
  get options(): DropdownOptions | null;
  get orderIndex(): number;
  
  validateAnswer(value: AnswerValue): Result<void>;
  
  static create(props: CreateQuestionProps, id?: UniqueEntityID): Result<Question>;
}
```

#### Assessment Entity
```typescript
export class Assessment extends Entity<AssessmentProps> {
  private constructor(props: AssessmentProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get companyId(): UniqueEntityID;
  get surveyVersionId(): UniqueEntityID;
  get status(): AssessmentStatus;
  get finalScore(): number;
  
  calculateProgress(totalQuestions: number, answeredQuestions: number): void;
  complete(): Result<void>;
  canBeAnsweredBy(userId: UniqueEntityID, userRole: string): boolean;
  
  static create(props: CreateAssessmentProps, id?: UniqueEntityID): Result<Assessment>;
}
```

#### Answer Entity
```typescript
export class Answer extends Entity<AnswerProps> {
  private constructor(props: AnswerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get assessmentId(): UniqueEntityID;
  get questionId(): UniqueEntityID;
  get value(): AnswerValue;
  get comment(): string | null;
  
  updateValue(value: AnswerValue): Result<void>;
  
  static create(props: CreateAnswerProps, id?: UniqueEntityID): Result<Answer>;
}
```

### Value Objects

#### QuestionType
```typescript
export enum QuestionTypeEnum {
  DROPDOWN = 'DROPDOWN',
  TEXT = 'TEXT',
  CNPJ = 'CNPJ',
  NUMBER = 'NUMBER',
  FILE_UPLOAD = 'FILE_UPLOAD'
}

export class QuestionType extends ValueObject<{ value: QuestionTypeEnum }> {
  get value(): QuestionTypeEnum;
  static create(value: string): Result<QuestionType>;
}
```

#### AnswerValue
```typescript
export class AnswerValue extends ValueObject<{ data: any }> {
  get data(): any;
  
  static createDropdown(selected: string): Result<AnswerValue>;
  static createText(text: string): Result<AnswerValue>;
  static createCNPJ(cnpj: string): Result<AnswerValue>;
  static createNumber(number: number): Result<AnswerValue>;
  static createFileUpload(fileIds: string[]): Result<AnswerValue>;
}
```

---

## 🛣️ Rotas da API

### Admin Routes (`/api/admin/surveys`)

**Autenticação requerida**: `user.role === 'ADMIN'`

```typescript
// Criar novo questionário
POST /api/admin/surveys
Body: {
  title: string;
  description: string;
}
Response: { surveyId: string }

// Atualizar questionário
PATCH /api/admin/surveys/:surveyId
Body: {
  title?: string;
  description?: string;
  isActive?: boolean;
}
Response: { success: boolean }

// Criar nova versão do questionário
POST /api/admin/surveys/:surveyId/versions
Body: {
  questions: Array<{
    text: string;
    type: 'DROPDOWN' | 'TEXT' | 'CNPJ' | 'NUMBER' | 'FILE_UPLOAD';
    options?: string[]; // Apenas para DROPDOWN
    orderIndex: number;
  }>;
}
Response: { versionId: string, versionNumber: number }

// Listar todos os questionários
GET /api/admin/surveys
Query: { isActive?: boolean }
Response: {
  surveys: Array<{
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    latestVersion: number;
    createdAt: string;
  }>
}

// Obter detalhes de um questionário
GET /api/admin/surveys/:surveyId
Response: {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  versions: Array<{
    id: string;
    versionNumber: number;
    effectiveDate: string;
    questionsCount: number;
  }>
}

// Obter respostas de uma empresa
GET /api/admin/assessments/:assessmentId
Response: {
  id: string;
  company: { id: string, name: string, cnpj: string };
  survey: { title: string, version: number };
  status: string;
  progress: number;
  answers: Array<{
    questionText: string;
    questionType: string;
    value: any;
    comment: string | null;
  }>;
  completedAt: string | null;
}

// Listar assessments (com filtros)
GET /api/admin/assessments
Query: {
  companyId?: string;
  surveyId?: string;
  status?: 'IN_PROGRESS' | 'COMPLETED';
}
Response: {
  assessments: Array<{
    id: string;
    company: { name: string, cnpj: string };
    survey: { title: string };
    status: string;
    progress: number;
    createdAt: string;
    updatedAt: string;
  }>
}
```

### User Routes (`/api/surveys`)

**Autenticação requerida**: `user.role === 'NORMAL'`
**Permissão**: `company_member.role === 'OWNER'`

```typescript
// Listar questionários pendentes
GET /api/surveys/pending
Response: {
  pending: Array<{
    surveyId: string;
    surveyTitle: string;
    surveyDescription: string;
    versionId: string;
    versionNumber: number;
    totalQuestions: number;
    assessmentId: string | null; // Se já iniciou
    progress: number; // 0-100
  }>
}

// Iniciar ou retomar assessment
POST /api/surveys/:surveyId/start
Response: {
  assessmentId: string;
  surveyTitle: string;
  totalQuestions: number;
  currentProgress: number;
}

// Obter perguntas de uma página
GET /api/surveys/assessments/:assessmentId/questions
Query: { page: number } // 5 perguntas por página (page 1, 2, 3...)
Response: {
  assessmentId: string;
  page: number;
  totalPages: number;
  progress: number; // 0-100
  questions: Array<{
    id: string;
    text: string;
    type: 'DROPDOWN' | 'TEXT' | 'CNPJ' | 'NUMBER' | 'FILE_UPLOAD';
    options?: string[]; // Apenas para DROPDOWN
    orderIndex: number;
    currentAnswer?: {
      value: any;
      comment: string | null;
    };
  }>
}

// Submeter respostas de uma página
POST /api/surveys/assessments/:assessmentId/answers
Body: {
  answers: Array<{
    questionId: string;
    value: any; // Estrutura varia por tipo
    comment?: string;
  }>;
}
Response: {
  success: boolean;
  progress: number; // Atualizado
  isCompleted: boolean;
}

// Finalizar assessment (marca como COMPLETED)
POST /api/surveys/assessments/:assessmentId/complete
Response: {
  success: boolean;
  finalScore: number;
  completedAt: string;
}

// Obter progresso atual
GET /api/surveys/assessments/:assessmentId/progress
Response: {
  assessmentId: string;
  surveyTitle: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  answeredQuestions: number;
  totalQuestions: number;
  lastAnsweredAt: string | null;
}

// Upload de arquivo (para perguntas FILE_UPLOAD)
POST /api/surveys/upload
Content-Type: multipart/form-data
Body: { file: File }
Response: {
  fileId: string;
  filename: string;
  storagePath: string;
}
```

---

## 🎨 Arquitetura Frontend

### Estrutura de Diretórios

```
frontend/src/
├── pages/
│   └── SurveyPage.tsx
├── views/
│   └── SurveyResponseView.tsx
├── components/
│   ├── survey/
│   │   ├── SurveyProgress.tsx
│   │   ├── SurveyProgress.spec.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionCard.spec.tsx
│   │   ├── DropdownQuestion.tsx
│   │   ├── TextQuestion.tsx
│   │   ├── CNPJQuestion.tsx
│   │   ├── NumberQuestion.tsx
│   │   ├── FileUploadQuestion.tsx
│   │   ├── SurveyNavigation.tsx
│   │   └── SurveyCompletionModal.tsx
├── hooks/
│   ├── useSurveyResponse.ts
│   ├── useSurveyResponse.spec.ts
│   ├── useSurveyNavigation.ts
│   └── useSurveyUpload.ts
├── services/
│   ├── surveyService.ts
│   └── surveyService.spec.ts
└── types/
    └── survey.types.ts
```

### Componentes Principais

#### SurveyResponseView.tsx
```typescript
/**
 * View principal para responder questionário
 * Responsabilidades:
 * - Carregar perguntas da página atual
 * - Gerenciar estado local das respostas
 * - Auto-save a cada resposta
 * - Navegação entre páginas
 * - Exibir barra de progresso
 */
```

#### SurveyProgress.tsx
```typescript
/**
 * Barra de progresso do questionário
 * Props:
 * - progress: number (0-100)
 * - surveyTitle: string
 * Aparece fixo no topo da página
 */
```

#### QuestionCard.tsx
```typescript
/**
 * Container de pergunta individual
 * Props:
 * - question: Question
 * - value: any
 * - onChange: (value: any) => void
 * - error?: string
 * Renderiza o componente correto baseado no type
 */
```

#### DropdownQuestion.tsx
```typescript
/**
 * Dropdown com seleção única
 * Usa shadcn/ui Select component
 */
```

#### CNPJQuestion.tsx
```typescript
/**
 * Input com máscara de CNPJ
 * Formato: XX.XXX.XXX/XXXX-XX
 * Validação apenas de formato
 */
```

#### FileUploadQuestion.tsx
```typescript
/**
 * Upload múltiplo de arquivos
 * Funcionalidades:
 * - Drag and drop
 * - Click para selecionar
 * - Preview de arquivos adicionados
 * - Remoção de arquivos
 * - Upload automático ao adicionar
 */
```

#### SurveyNavigation.tsx
```typescript
/**
 * Botões de navegação
 * - Voltar (se não for primeira página)
 * - Próxima (se não for última página)
 * - Finalizar (apenas última página)
 * - Salvar e Sair
 */
```

#### SurveyCompletionModal.tsx
```typescript
/**
 * Modal de confirmação ao finalizar
 * Exibe:
 * - Mensagem de sucesso
 * - Botão para voltar à página principal
 */
```

### Hooks Customizados

#### useSurveyResponse.ts
```typescript
/**
 * Gerencia estado e lógica do questionário
 * Returns:
 * - questions: Question[]
 * - answers: Map<questionId, value>
 * - progress: number
 * - currentPage: number
 * - totalPages: number
 * - isLoading: boolean
 * - error: string | null
 * - handleAnswerChange: (questionId, value) => void
 * - goToNextPage: () => Promise<void>
 * - goToPreviousPage: () => Promise<void>
 * - completeAssessment: () => Promise<void>
 * - saveAndExit: () => Promise<void>
 */
```

#### useSurveyNavigation.ts
```typescript
/**
 * Gerencia navegação e salvamento
 * Previne perda de dados não salvos
 */
```

#### useSurveyUpload.ts
```typescript
/**
 * Gerencia upload de arquivos
 * Returns:
 * - uploadFile: (file: File) => Promise<string>
 * - isUploading: boolean
 * - progress: number
 */
```

### Services

#### surveyService.ts
```typescript
export const surveyService = {
  // Listar pendentes
  getPendingSurveys(): Promise<PendingSurvey[]>;
  
  // Iniciar/retomar
  startAssessment(surveyId: string): Promise<Assessment>;
  
  // Carregar perguntas da página
  getQuestions(assessmentId: string, page: number): Promise<QuestionsPage>;
  
  // Submeter respostas
  submitAnswers(assessmentId: string, answers: Answer[]): Promise<SubmitResponse>;
  
  // Finalizar
  completeAssessment(assessmentId: string): Promise<CompletionResponse>;
  
  // Progresso
  getProgress(assessmentId: string): Promise<Progress>;
  
  // Upload
  uploadFile(file: File): Promise<FileUploadResponse>;
};
```

---

## 🔄 Fluxo de Usuário

### Fluxo Completo

```
1. Usuário (OWNER) faz login
2. Sistema verifica se há questionários pendentes (GET /api/surveys/pending)
3. [FORA DO ESCOPO DESTA FASE] Exibe notificação/card no dashboard
4. Usuário clica para responder questionário
5. Sistema navega para /surveys/:surveyId
6. Sistema chama POST /api/surveys/:surveyId/start (cria ou retoma assessment)
7. Sistema carrega primeira página: GET /api/surveys/assessments/:assessmentId/questions?page=1
8. Usuário responde perguntas da página
9. A cada resposta alterada:
   - Atualiza estado local
   - Debounce de 500ms
   - Chama POST /api/surveys/assessments/:assessmentId/answers
   - Atualiza barra de progresso
10. Usuário clica em "Próxima"
    - Valida respostas obrigatórias
    - Incrementa página
    - Carrega próximas perguntas
11. Usuário pode clicar "Voltar" para editar respostas anteriores
12. Na última página, botão "Finalizar" aparece
13. Ao clicar "Finalizar":
    - POST /api/surveys/assessments/:assessmentId/complete
    - Exibe SurveyCompletionModal
14. Usuário clica "Voltar para Início"
    - Navega para /dashboard
```

### Regras de Auto-Save

- **Trigger**: onChange de qualquer input
- **Debounce**: 500ms
- **Estratégia**: Salvar apenas a resposta alterada (não toda a página)
- **Loading**: Mostrar indicador discreto durante salvamento
- **Erro**: Mostrar toast de erro, manter resposta no estado local, tentar novamente

### Navegação Entre Páginas

- **Página 1**: Mostra apenas "Próxima" e "Salvar e Sair"
- **Páginas intermediárias**: Mostra "Voltar", "Próxima" e "Salvar e Sair"
- **Última página**: Mostra "Voltar", "Finalizar" e "Salvar e Sair"
- **Salvar e Sair**: Salva progresso e redireciona para dashboard
- **Barra de progresso**: Sempre visível no topo, atualiza em tempo real

---

## 📐 Regras de Negócio

### Criação e Versionamento

1. **Admin cria survey**: Apenas título e descrição inicial
2. **Admin cria versão**: Define perguntas (texto, tipo, ordem, opções)
3. **Versionamento**: Cada alteração nas perguntas = nova versão
4. **Número da versão**: Auto-incrementado por survey
5. **Data efetiva**: Data/hora da criação da versão

### Atribuição Automática

1. Quando um survey é **ativado** (`is_active = true`):
   - Sistema verifica todas as companies com `subscription.status = 'ACTIVE'`
   - Para cada company, verifica se já existe assessment para a versão mais recente
   - Se não existe, o survey aparece como pendente

2. Quando uma **nova versão** é criada de um survey ativo:
   - Sistema verifica todas as companies ativas
   - Para cada company, o novo questionário aparece como pendente
   - Assessments antigos (versões anteriores) permanecem, mas não aparecem mais como pendentes

### Permissões de Resposta

1. **Apenas OWNER** pode responder questionários
2. **Validação no backend**: 
   - Verificar `user.id` está em `company_members` com `role = 'OWNER'`
   - Verificar `company_members.is_active = true`
   - Verificar `subscription.status = 'ACTIVE'`

### Permissões de Visualização

1. **Admin**: Pode ver todas as respostas de todas as empresas
2. **OWNER**: Pode ver apenas respostas de sua própria empresa
3. **EMPLOYEE**: Não pode ver respostas (fora do escopo atual)

### Progresso e Conclusão

1. **Cálculo de progresso**:
   ```typescript
   progress = (answeredQuestions / totalQuestions) * 100
   ```
2. **Pergunta considerada respondida**: Quando existe registro em `answers` para aquela `question_id`
3. **Assessment COMPLETED**: Quando usuário clica em "Finalizar" na última página
4. **Validação ao finalizar**: 
   - Verificar se todas as perguntas têm resposta
   - Se faltarem, mostrar erro e não permitir finalizar

### Desativação de Survey

1. Admin pode desativar survey (`is_active = false`)
2. Assessments **IN_PROGRESS** permanecem no banco
3. Survey desativado **não aparece mais** na lista de pendentes
4. Usuário pode ver assessments anteriores (histórico)

### Validações de Respostas

#### DROPDOWN
- Valor deve estar na lista de options
- Campo obrigatório

#### TEXT
- Aceita qualquer string
- Pode ter validação de tamanho (opcional)

#### CNPJ
- Formato: XX.XXX.XXX/XXXX-XX (14 dígitos)
- Validação apenas de formato (não valida dígitos verificadores)
- Campo obrigatório

#### NUMBER
- Apenas inteiros
- Sem range mínimo/máximo

#### FILE_UPLOAD
- Múltiplos arquivos permitidos
- Todos os tipos aceitos
- Sem limite de tamanho (por enquanto)
- Arquivos salvos em `financial_uploads`
- Resposta armazena array de `fileIds`

---

## 🧪 Diretrizes de Desenvolvimento

### Test-Driven Development (TDD)

**OBRIGATÓRIO**: Escrever testes ANTES da implementação

#### Ordem de Desenvolvimento
```
1. Escrever teste (RED)
2. Implementar código mínimo para passar (GREEN)
3. Refatorar mantendo testes passando (REFACTOR)
4. Repetir
```

#### Cobertura Mínima
- **Entities**: 100% de cobertura
- **Value Objects**: 100% de cobertura
- **Use Cases**: 100% de cobertura
- **Controllers**: 80% de cobertura
- **Repositories**: Integration tests

#### Ferramentas
- **Backend**: Jest + TypeORM (in-memory database para testes)
- **Frontend**: Vitest + React Testing Library

### Arquitetura Clean/DDD

#### Camadas e Dependências
```
Presentation → Application → Domain ← Infrastructure
                    ↓
                  Domain (independente)
```

#### Princípios
1. **Domain** não depende de nada
2. **Application** depende apenas de Domain
3. **Infrastructure** implementa interfaces do Domain
4. **Presentation** orquestra Application e Infrastructure

#### Entities vs Value Objects
- **Entity**: Tem identidade única (id)
- **Value Object**: Definido por seus atributos, imutável

### Padrões de Código

#### Backend (NestJS + TypeScript)

```typescript
// Use Result pattern para tratamento de erros
export class CreateSurveyUseCase implements UseCase<CreateSurveyDTO, Result<Survey>> {
  async execute(request: CreateSurveyDTO): Promise<Result<Survey>> {
    // Validações retornam Result.fail
    if (!request.title) {
      return Result.fail<Survey>('Title is required');
    }
    
    // Criação de entidade retorna Result
    const surveyOrError = Survey.create(request);
    if (surveyOrError.isFailure) {
      return Result.fail<Survey>(surveyOrError.error);
    }
    
    // Sucesso retorna Result.ok
    const survey = surveyOrError.getValue();
    await this.surveyRepo.save(survey);
    return Result.ok<Survey>(survey);
  }
}
```

#### Frontend (React + TypeScript)

```typescript
// Componentes funcionais com TypeScript
interface QuestionCardProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  value,
  onChange,
  error
}) => {
  // Lógica do componente
};

// Hooks customizados com tipos
export const useSurveyResponse = (assessmentId: string): UseSurveyResponseReturn => {
  const [state, setState] = useState<SurveyState>(initialState);
  // ...
  return { /* ... */ };
};
```

## 📝 Checklist de Implementação

### Backend

#### 1. Database
- [ ] Criar migration para novas tabelas
- [ ] Criar migration para adicionar `role` em `users`
- [ ] Adicionar índices de performance
- [ ] Testar migrations (up e down)

#### 2. Domain Layer
- [ ] Criar entities com testes (Survey, SurveyVersion, Question, Assessment, Answer)
- [ ] Criar value objects com testes (QuestionType, AssessmentStatus, AnswerValue, etc)
- [ ] Criar interfaces de repositório

#### 3. Application Layer
- [ ] Implementar use cases com testes (todos listados na estrutura)
- [ ] Validar regras de negócio
- [ ] Implementar cálculo de progresso

#### 4. Infrastructure Layer
- [ ] Criar schemas do TypeORM
- [ ] Implementar repositórios com testes
- [ ] Configurar relacionamentos

#### 5. Presentation Layer
- [ ] Criar DTOs com class-validator
- [ ] Implementar controllers com testes
- [ ] Criar guards de autorização (Admin, Owner)
- [ ] Documentar rotas com Swagger

#### 6. Integration
- [ ] Configurar módulo no app.module.ts
- [ ] Testar fluxo completo (E2E tests)

### Frontend

#### 1. Types e Interfaces
- [ ] Definir tipos TypeScript para todas as entidades

#### 2. Services
- [ ] Implementar surveyService com testes
- [ ] Configurar axios interceptors

#### 3. Hooks
- [ ] Implementar useSurveyResponse com testes
- [ ] Implementar useSurveyNavigation
- [ ] Implementar useSurveyUpload

#### 4. Components
- [ ] SurveyProgress com testes
- [ ] QuestionCard com testes
- [ ] Componentes específicos de cada tipo de pergunta
- [ ] SurveyNavigation
- [ ] SurveyCompletionModal

#### 5. Views
- [ ] SurveyResponseView
- [ ] Integrar com roteamento

#### 6. Styling
- [ ] Seguir identidade visual existente
- [ ] Responsividade mobile
- [ ] Temas (light/dark)

#### 7. Testing
- [ ] Testes unitários de componentes
- [ ] Testes de integração de fluxo completo

---

## 🚀 Próximos Passos (Fora do Escopo Atual)

1. **Dashboard Integration**
   - Card de questionários pendentes
   - Notificações
   - Histórico de questionários respondidos

2. **Admin Dashboard**
   - Interface para criar/editar questionários
   - Visualização de respostas
   - Relatórios e analytics

3. **Features Avançadas**
   - Perguntas condicionais (lógica de skip)
   - Perguntas obrigatórias vs opcionais
   - Seções/grupos de perguntas
   - Templates de questionários

4. **Otimizações**
   - Cache de questionários ativos
   - Pré-carregamento de próxima página
   - Compressão de uploads

---
