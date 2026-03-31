# Types

## Convenção
- Naming: `{domain}.types.ts`
- Espelhar DTOs do backend — manter sincronizado manualmente
- Exportar interfaces e enums, não classes

## Arquivo Atual

### `survey.types.ts`
- `Survey` — metadata com progresso
- `Question` — texto, tipo, ordem, opções
- `QuestionType` — DROPDOWN | TEXT | CNPJ | NUMBER | FILE_UPLOAD
- `Assessment` — instância ativa de resposta
- `QuestionsPage` — resposta paginada de questions
- `AnswerInput` — payload de submissão
- `CompletedAssessment` — assessment finalizado
- `AssessmentResponse` — resposta individual

## Tipos Inline
Outros domínios (auth, financial, company) definem tipos inline nos services ou ViewModels. À medida que crescerem, extrair para `{domain}.types.ts`.
