# 🧪 Guia de Teste Manual - Survey Module

## 📝 Pré-requisitos

1. Backend rodando: `npm run start:dev`
2. Banco de dados PostgreSQL ativo
3. Cliente HTTP (Postman, Insomnia, ou curl)
4. User autenticado com role ADMIN (para endpoints admin)
5. User autenticado com role OWNER (para endpoints user)

**Nota**: Por enquanto, guards não estão implementados, então autenticação não é obrigatória para testes.

---

## 🎯 Teste 1: Criar Survey e Versão (Admin)

### Passo 1: Criar Survey

**Request:**
```http
POST http://localhost:3000/api/admin/surveys
Content-Type: application/json

{
  "title": "Teste Survey",
  "description": "Survey para testar o sistema"
}
```

**Response Esperado:**
```json
{
  "surveyId": "uuid-aqui"
}
```

**✅ Verificar:**
- Status code 201
- Response contém surveyId válido
- Survey foi criado no banco (tabela surveys)

**Salvar**: `surveyId` para próximos passos

---

### Passo 2: Criar Versão com Perguntas

**Request:**
```http
POST http://localhost:3000/api/admin/surveys/versions
Content-Type: application/json

{
  "surveyId": "SEU-SURVEY-ID-AQUI",
  "effectiveDate": "2024-01-01T00:00:00Z",
  "questions": [
    {
      "text": "Qual o setor?",
      "type": "DROPDOWN",
      "options": ["Tecnologia", "Varejo", "Serviços"],
      "orderIndex": 1
    },
    {
      "text": "Qual o CNPJ?",
      "type": "CNPJ",
      "orderIndex": 2
    },
    {
      "text": "Quantos funcionários?",
      "type": "NUMBER",
      "orderIndex": 3
    },
    {
      "text": "Descreva os desafios",
      "type": "TEXT",
      "orderIndex": 4
    },
    {
      "text": "Upload de docs",
      "type": "FILE_UPLOAD",
      "orderIndex": 5
    },
    {
      "text": "Tem planejamento estratégico?",
      "type": "DROPDOWN",
      "options": ["Sim", "Não", "Em desenvolvimento"],
      "orderIndex": 6
    }
  ]
}
```

**Response Esperado:**
```json
{
  "versionId": "uuid-aqui",
  "versionNumber": 1,
  "questionCount": 6
}
```

**✅ Verificar:**
- Status code 201
- Response contém versionId e versionNumber = 1
- questionCount = 6
- Perguntas foram criadas no banco (tabela questions)

**Salvar**: `versionId` para referência

---

## 🎯 Teste 2: Fluxo do Usuário (Responder Survey)

### Passo 1: Listar Surveys Pendentes

**Request:**
```http
GET http://localhost:3000/api/surveys/pending?companyId=SEU-COMPANY-ID
```

**Response Esperado:**
```json
{
  "pendingSurveys": [
    {
      "surveyId": "uuid",
      "title": "Teste Survey",
      "description": "Survey para testar o sistema",
      "hasStarted": false,
      "progress": null,
      "assessmentId": null
    }
  ]
}
```

**✅ Verificar:**
- Status code 200
- Survey criado aparece na lista
- hasStarted = false (ainda não iniciou)

---

### Passo 2: Iniciar Assessment

**Request:**
```http
POST http://localhost:3000/api/surveys/SEU-SURVEY-ID/start
Content-Type: application/json

{
  "companyId": "SEU-COMPANY-ID"
}
```

**Response Esperado:**
```json
{
  "assessmentId": "uuid-aqui",
  "surveyTitle": "Teste Survey",
  "totalQuestions": 6,
  "currentProgress": 0,
  "isResuming": false
}
```

**✅ Verificar:**
- Status code 200
- assessmentId gerado
- totalQuestions = 6
- currentProgress = 0
- isResuming = false

**Salvar**: `assessmentId` para próximos passos

---

### Passo 3: Buscar Primeira Página de Perguntas

**Request:**
```http
GET http://localhost:3000/api/surveys/assessments/SEU-ASSESSMENT-ID/questions?page=1
```

**Response Esperado:**
```json
{
  "assessmentId": "uuid",
  "page": 1,
  "totalPages": 2,
  "progress": 0,
  "questions": [
    {
      "id": "uuid-q1",
      "text": "Qual o setor?",
      "type": "DROPDOWN",
      "options": ["Tecnologia", "Varejo", "Serviços"],
      "orderIndex": 1,
      "currentAnswer": null
    },
    {
      "id": "uuid-q2",
      "text": "Qual o CNPJ?",
      "type": "CNPJ",
      "orderIndex": 2,
      "currentAnswer": null
    },
    {
      "id": "uuid-q3",
      "text": "Quantos funcionários?",
      "type": "NUMBER",
      "orderIndex": 3,
      "currentAnswer": null
    },
    {
      "id": "uuid-q4",
      "text": "Descreva os desafios",
      "type": "TEXT",
      "orderIndex": 4,
      "currentAnswer": null
    },
    {
      "id": "uuid-q5",
      "text": "Upload de docs",
      "type": "FILE_UPLOAD",
      "orderIndex": 5,
      "currentAnswer": null
    }
  ]
}
```

**✅ Verificar:**
- Status code 200
- page = 1
- totalPages = 2 (6 perguntas / 5 por página)
- Retorna 5 perguntas
- Todas com currentAnswer = null

**Salvar**: IDs das perguntas para responder

---

### Passo 4: Enviar Respostas da Primeira Página

**Request:**
```http
POST http://localhost:3000/api/surveys/assessments/SEU-ASSESSMENT-ID/answers
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "ID-QUESTAO-1",
      "value": {
        "selected": "Tecnologia"
      },
      "comment": "Atuamos com SaaS"
    },
    {
      "questionId": "ID-QUESTAO-2",
      "value": {
        "cnpj": "12.345.678/0001-90"
      }
    },
    {
      "questionId": "ID-QUESTAO-3",
      "value": {
        "number": 45
      }
    },
    {
      "questionId": "ID-QUESTAO-4",
      "value": {
        "text": "Principais desafios incluem crescimento sustentável e retenção de talentos."
      }
    },
    {
      "questionId": "ID-QUESTAO-5",
      "value": {
        "fileIds": []
      },
      "comment": "Sem arquivos por enquanto"
    }
  ]
}
```

**Response Esperado:**
```json
{
  "success": true,
  "progress": 83,
  "isCompleted": false
}
```

**✅ Verificar:**
- Status code 200
- success = true
- progress = 83 (5 de 6 perguntas = 83.33%)
- isCompleted = false

---

### Passo 5: Buscar Segunda Página

**Request:**
```http
GET http://localhost:3000/api/surveys/assessments/SEU-ASSESSMENT-ID/questions?page=2
```

**Response Esperado:**
```json
{
  "assessmentId": "uuid",
  "page": 2,
  "totalPages": 2,
  "progress": 83,
  "questions": [
    {
      "id": "uuid-q6",
      "text": "Tem planejamento estratégico?",
      "type": "DROPDOWN",
      "options": ["Sim", "Não", "Em desenvolvimento"],
      "orderIndex": 6,
      "currentAnswer": null
    }
  ]
}
```

**✅ Verificar:**
- page = 2
- totalPages = 2
- progress = 83 (mantém progresso anterior)
- Retorna 1 pergunta (última)

---

### Passo 6: Responder Última Pergunta

**Request:**
```http
POST http://localhost:3000/api/surveys/assessments/SEU-ASSESSMENT-ID/answers
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "ID-QUESTAO-6",
      "value": {
        "selected": "Em desenvolvimento"
      }
    }
  ]
}
```

**Response Esperado:**
```json
{
  "success": true,
  "progress": 100,
  "isCompleted": true
}
```

**✅ Verificar:**
- progress = 100
- isCompleted = true

---

### Passo 7: Completar Assessment

**Request:**
```http
POST http://localhost:3000/api/surveys/assessments/SEU-ASSESSMENT-ID/complete
```

**Response Esperado:**
```json
{
  "success": true,
  "finalScore": 100,
  "completedAt": "2024-01-07T..."
}
```

**✅ Verificar:**
- Status code 200
- success = true
- finalScore = 100
- completedAt tem data válida
- Assessment no banco está com status = 'COMPLETED'

---

## 🎯 Teste 3: Retomada de Assessment

### Passo 1: Criar Novo Assessment

Repita passos de iniciar assessment.

### Passo 2: Responder Apenas Primeira Página

Envie respostas apenas para 2-3 perguntas.

### Passo 3: Verificar Pending Surveys

**Request:**
```http
GET http://localhost:3000/api/surveys/pending?companyId=SEU-COMPANY-ID
```

**Response Esperado:**
```json
{
  "pendingSurveys": [
    {
      "surveyId": "uuid",
      "title": "Teste Survey",
      "description": "...",
      "hasStarted": true,
      "progress": 33,
      "assessmentId": "uuid-assessment"
    }
  ]
}
```

**✅ Verificar:**
- hasStarted = true
- progress > 0 e < 100
- assessmentId presente

### Passo 4: Retomar Assessment

**Request:**
```http
POST http://localhost:3000/api/surveys/SEU-SURVEY-ID/start
Content-Type: application/json

{
  "companyId": "SEU-COMPANY-ID"
}
```

**Response Esperado:**
```json
{
  "assessmentId": "mesmo-uuid-anterior",
  "surveyTitle": "Teste Survey",
  "totalQuestions": 6,
  "currentProgress": 33,
  "isResuming": true
}
```

**✅ Verificar:**
- assessmentId é o mesmo
- currentProgress mantém valor anterior
- **isResuming = true**

### Passo 5: Buscar Perguntas e Ver Respostas Anteriores

**Request:**
```http
GET http://localhost:3000/api/surveys/assessments/SEU-ASSESSMENT-ID/questions?page=1
```

**✅ Verificar:**
- Perguntas respondidas têm currentAnswer preenchido
- Perguntas não respondidas têm currentAnswer = null

---

## 🎯 Teste 4: Validações

### Teste 4.1: CNPJ Inválido

**Request:**
```http
POST http://localhost:3000/api/surveys/assessments/SEU-ASSESSMENT-ID/answers
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "ID-QUESTAO-CNPJ",
      "value": {
        "cnpj": "12345678"
      }
    }
  ]
}
```

**Response Esperado:**
```json
{
  "success": false,
  "error": "Invalid answer for question ...: CNPJ must be in format XX.XXX.XXX/XXXX-XX"
}
```

### Teste 4.2: Completar Sem 100%

**Request:**
```http
POST http://localhost:3000/api/surveys/assessments/ASSESSMENT-SEM-TODAS-RESPOSTAS/complete
```

**Response Esperado:**
```json
{
  "success": false,
  "error": "Cannot complete assessment. Answered X out of Y questions."
}
```

### Teste 4.3: Dropdown com Opção Inválida

**Request:**
```http
POST http://localhost:3000/api/surveys/assessments/SEU-ASSESSMENT-ID/answers
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "ID-DROPDOWN",
      "value": {
        "selected": "Opção que não existe"
      }
    }
  ]
}
```

**Response Esperado:**
Deve falhar com erro de validação.

---

## ✅ Checklist Completo

- [ ] Criar survey com sucesso
- [ ] Criar versão com 6 perguntas
- [ ] Listar surveys pendentes
- [ ] Iniciar assessment novo
- [ ] Buscar página 1 de perguntas
- [ ] Responder página 1 (5 perguntas)
- [ ] Verificar progress = 83%
- [ ] Buscar página 2
- [ ] Responder última pergunta
- [ ] Verificar progress = 100%
- [ ] Completar assessment
- [ ] Verificar status = COMPLETED
- [ ] Retomar assessment parcial
- [ ] Verificar isResuming = true
- [ ] Ver respostas anteriores em currentAnswer
- [ ] Validar CNPJ inválido
- [ ] Validar número com texto
- [ ] Validar dropdown com opção inválida
- [ ] Tentar completar sem 100%

---

## 🐛 Problemas Comuns

### Assessment não retorna perguntas
- Verificar se survey_version_id está correto
- Verificar se perguntas foram criadas no banco

### Progress não atualiza
- Verificar se todas as respostas foram salvas
- Recalcular com GET questions

### Não consegue completar
- Verificar se progress = 100
- Verificar se todas as perguntas têm respostas

### currentAnswer sempre null
- Verificar se answers foram salvos no banco
- Verificar relacionamento assessment_id + question_id
