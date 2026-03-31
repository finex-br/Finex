# Survey Module

## Domínio

Questionários de maturidade empresarial. Admins criam surveys, usuários respondem via assessments.

### Hierarquia de Entidades
```
Survey → SurveyVersion → Question (com QuestionType + DropdownOptions)
Assessment → Answer (vinculada a Question)
```

- **Survey** — metadata (título, descrição, estimatedTimeMinutes)
- **SurveyVersion** — versionamento de perguntas (cada edição cria nova versão)
- **Question** — texto, tipo, ordem, opções (para DROPDOWN)
- **Assessment** — instância de resposta de um usuário para uma SurveyVersion
- **Answer** — resposta individual a uma Question

### Value Objects
- `QuestionType` — DROPDOWN | TEXT | CNPJ | NUMBER | FILE_UPLOAD
- `AssessmentStatus` — status do assessment (IN_PROGRESS, COMPLETED)
- `AnswerValue` — valor da resposta
- `DropdownOptions` — lista de opções para DROPDOWN

## Fluxos
- **Admin**: CreateSurvey → AddQuestion → GetAllSurveys, GetCompletedAssessments
- **Usuário**: GetPendingSurveys → StartAssessment → GetQuestions (paginado, 1/página) → SubmitAnswers (auto-save) → CompleteAssessment

## DI Tokens
```
'ISurveyRepository', 'ISurveyVersionRepository', 'IQuestionRepository'
'IAssessmentRepository', 'IAnswerRepository', 'ICompanyRepository'
'AdminCreateSurveyUseCase'
```

## Controllers
- `AdminSurveyController` — CRUD de surveys (requer ADMIN)
- `UserSurveyController` — responder questionários (qualquer usuário autenticado)
