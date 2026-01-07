# 📋 Survey API - Guia de Uso

## 🎯 Endpoints Implementados

### Admin Endpoints

#### 1. Criar Survey
Cria um novo questionário (sem perguntas ainda)

```http
POST /api/admin/surveys
Content-Type: application/json

{
  "title": "Diagnóstico 360",
  "description": "Questionário completo de diagnóstico empresarial"
}
```

**Response:**
```json
{
  "surveyId": "uuid-survey"
}
```

#### 2. Criar Versão com Perguntas
Adiciona uma versão ao survey com as perguntas

```http
POST /api/admin/surveys/versions
Content-Type: application/json

{
  "surveyId": "uuid-survey",
  "effectiveDate": "2024-01-01T00:00:00Z",
  "questions": [
    {
      "text": "Qual o setor da sua empresa?",
      "type": "DROPDOWN",
      "options": ["Tecnologia", "Varejo", "Indústria", "Serviços"],
      "orderIndex": 1
    },
    {
      "text": "Qual o CNPJ da empresa?",
      "type": "CNPJ",
      "orderIndex": 2
    },
    {
      "text": "Quantos funcionários?",
      "type": "NUMBER",
      "orderIndex": 3
    },
    {
      "text": "Descreva o principal desafio da empresa",
      "type": "TEXT",
      "orderIndex": 4
    },
    {
      "text": "Faça upload de documentos relevantes",
      "type": "FILE_UPLOAD",
      "orderIndex": 5
    }
  ]
}
```

**Response:**
```json
{
  "versionId": "uuid-version",
  "versionNumber": 1,
  "questionCount": 5
}
```

---

### User Endpoints

#### 1. Listar Surveys Pendentes
Lista todos os surveys que a empresa ainda não completou

```http
GET /api/surveys/pending?companyId=uuid-company
```

**Response:**
```json
{
  "pendingSurveys": [
    {
      "surveyId": "uuid-survey",
      "title": "Diagnóstico 360",
      "description": "Questionário completo de diagnóstico empresarial",
      "hasStarted": false,
      "progress": null,
      "assessmentId": null
    }
  ]
}
```

#### 2. Iniciar ou Retomar Assessment
Inicia um novo assessment ou retoma um existente

```http
POST /api/surveys/uuid-survey/start
Content-Type: application/json

{
  "companyId": "uuid-company"
}
```

**Response:**
```json
{
  "assessmentId": "uuid-assessment",
  "surveyTitle": "Diagnóstico 360",
  "totalQuestions": 5,
  "currentProgress": 0,
  "isResuming": false
}
```

#### 3. Buscar Perguntas (Paginadas)
Retorna 5 perguntas por página

```http
GET /api/surveys/assessments/uuid-assessment/questions?page=1
```

**Response:**
```json
{
  "assessmentId": "uuid-assessment",
  "page": 1,
  "totalPages": 1,
  "progress": 0,
  "questions": [
    {
      "id": "uuid-q1",
      "text": "Qual o setor da sua empresa?",
      "type": "DROPDOWN",
      "options": ["Tecnologia", "Varejo", "Indústria", "Serviços"],
      "orderIndex": 1,
      "currentAnswer": null
    },
    {
      "id": "uuid-q2",
      "text": "Qual o CNPJ da empresa?",
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
      "text": "Descreva o principal desafio da empresa",
      "type": "TEXT",
      "orderIndex": 4,
      "currentAnswer": null
    },
    {
      "id": "uuid-q5",
      "text": "Faça upload de documentos relevantes",
      "type": "FILE_UPLOAD",
      "orderIndex": 5,
      "currentAnswer": null
    }
  ]
}
```

#### 4. Enviar Respostas
Envia respostas para uma ou mais perguntas (auto-save)

```http
POST /api/surveys/assessments/uuid-assessment/answers
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "uuid-q1",
      "value": {
        "selected": "Tecnologia"
      },
      "comment": "Atuamos com SaaS B2B"
    },
    {
      "questionId": "uuid-q2",
      "value": {
        "cnpj": "12.345.678/0001-90"
      }
    },
    {
      "questionId": "uuid-q3",
      "value": {
        "number": 50
      }
    },
    {
      "questionId": "uuid-q4",
      "value": {
        "text": "Nosso principal desafio é aumentar a retenção de clientes..."
      }
    },
    {
      "questionId": "uuid-q5",
      "value": {
        "fileIds": ["uuid-file1", "uuid-file2"]
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "progress": 100,
  "isCompleted": true
}
```

#### 5. Finalizar Assessment
Marca o assessment como completo (requer 100% das perguntas respondidas)

```http
POST /api/surveys/assessments/uuid-assessment/complete
```

**Response:**
```json
{
  "success": true,
  "finalScore": 100,
  "completedAt": "2024-01-15T14:30:00Z"
}
```

---

## 🎨 Formatos de Resposta por Tipo de Pergunta

### DROPDOWN
```json
{
  "questionId": "uuid",
  "value": {
    "selected": "Opção Escolhida"
  }
}
```

### TEXT
```json
{
  "questionId": "uuid",
  "value": {
    "text": "Resposta em texto livre..."
  }
}
```

### CNPJ
```json
{
  "questionId": "uuid",
  "value": {
    "cnpj": "12.345.678/0001-90"
  }
}
```

### NUMBER
```json
{
  "questionId": "uuid",
  "value": {
    "number": 42
  }
}
```

### FILE_UPLOAD
```json
{
  "questionId": "uuid",
  "value": {
    "fileIds": ["uuid-file1", "uuid-file2"]
  }
}
```

---

## 🔄 Fluxo Completo de Uso

### Para Administradores:
1. Criar survey: `POST /admin/surveys`
2. Criar versão com perguntas: `POST /admin/surveys/versions`
3. Survey fica automaticamente ativo e disponível para empresas

### Para Usuários (Empresas):
1. Listar surveys pendentes: `GET /surveys/pending?companyId=X`
2. Iniciar assessment: `POST /surveys/:surveyId/start`
3. Buscar primeira página de perguntas: `GET /assessments/:id/questions?page=1`
4. Responder perguntas: `POST /assessments/:id/answers` (pode enviar múltiplas)
5. Se houver mais páginas, buscar próxima: `GET /assessments/:id/questions?page=2`
6. Quando todas respondidas, finalizar: `POST /assessments/:id/complete`

---

## ✨ Features Implementadas

- ✅ **Auto-save**: Respostas são salvas automaticamente, pode retomar depois
- ✅ **Paginação**: 5 perguntas por página para melhor UX
- ✅ **Progresso em Tempo Real**: Cada envio de resposta retorna o % de progresso
- ✅ **Validação Forte**: Cada tipo de pergunta tem validação específica
- ✅ **Versionamento**: Surveys podem ter múltiplas versões
- ✅ **Retomada**: Se sair no meio, pode continuar de onde parou
- ✅ **Comentários**: Cada resposta pode ter um comentário opcional

---

## 🔜 Próximos Passos

### Backend
- [ ] Implementar Guards para Admin e Owner roles
- [ ] Adicionar endpoints de atualização de survey
- [ ] Implementar endpoint de listagem de assessments
- [ ] Adicionar soft delete para surveys

### Frontend
- [ ] Criar serviço de API para surveys
- [ ] Implementar página de listagem de surveys pendentes
- [ ] Criar componente de questionário com paginação
- [ ] Implementar barra de progresso
- [ ] Adicionar componentes para cada tipo de pergunta
- [ ] Implementar upload de arquivos
