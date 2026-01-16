# 📤 Sistema de Upload Flexível de Documentos

## 🎯 Visão Geral

Sistema que permite upload de documentos financeiros com estruturas variadas, com mapeamento manual de colunas e validação antes da importação final.

### 🔥 **Problema Resolvido**

**Antes**: Sistema exigia estrutura rígida de colunas (Data, Descrição, Categoria, Valor, Tipo)
**Agora**: Aceita qualquer estrutura, permite mapeamento customizado, validação e aprovação

---

## 🏗️ Arquitetura

### **Fluxo Completo**

```
┌─────────────┐
│   UPLOAD    │ ──> Documento bruto enviado
└──────┬──────┘     Status: UPLOADED
       │
       ↓
┌─────────────┐
│   MAPPING   │ ──> Usuário mapeia colunas
└──────┬──────┘     Status: MAPPED
       │
       ↓
┌─────────────┐
│ VALIDATION  │ ──> Sistema valida dados
└──────┬──────┘     Status: VALIDATED
       │
       ↓
┌─────────────┐
│  APPROVAL   │ ──> Importa para tabela principal
└──────┬──────┘     Status: APPROVED
       │
       ↓
┌─────────────┐
│  DASHBOARD  │ ──> Dados aparecem no dashboard
└─────────────┘
```

---

## 📊 Estados do Documento

| Status | Descrição | Próximos Estados Possíveis |
|--------|-----------|----------------------------|
| `UPLOADED` | Recém enviado, aguardando mapeamento | MAPPED, REJECTED |
| `MAPPED` | Colunas mapeadas, aguardando validação | VALIDATED, REJECTED |
| `VALIDATED` | Dados validados, aguardando aprovação | APPROVED, REJECTED |
| `APPROVED` | Aprovado e importado (estado final) | - |
| `REJECTED` | Rejeitado por erros ou manualmente (estado final) | - |

---

## 🔌 API Endpoints

### 1. **POST /financial/upload-raw**
Upload de documento sem processamento

**Request:**
```typescript
{
  file: File (multipart/form-data)
}
```

**Response:**
```typescript
{
  success: true,
  documentId: "uuid",
  message: "Documento carregado com sucesso",
  preview: {
    headers: ["Coluna A", "Coluna B", "Coluna C"],
    sampleRows: [
      ["2024-01-15", "Venda", 1500.50],
      ["2024-01-16", "Compra", -350.75]
    ],
    totalRows: 150
  },
  suggestedMapping: {
    date: "Coluna A",
    description: "Coluna B",
    amount: "Coluna C"
  }
}
```

---

### 2. **GET /financial/pending-documents**
Lista documentos pendentes

**Query Params:**
- `status` (opcional): UPLOADED, MAPPED, VALIDATED, etc

**Response:**
```typescript
{
  success: true,
  total: 5,
  documents: [
    {
      id: "uuid",
      fileName: "vendas_janeiro.xlsx",
      fileSize: 45632,
      status: "UPLOADED",
      totalRows: 150,
      hasMapping: false,
      hasValidation: false,
      createdAt: "2024-01-15T10:30:00Z",
      uploadedBy: "user-123"
    }
  ]
}
```

---

### 3. **GET /financial/pending-documents/:id**
Detalhes de um documento

**Response:**
```typescript
{
  success: true,
  document: {
    id: "uuid",
    fileName: "vendas_janeiro.xlsx",
    status: "UPLOADED",
    headers: ["Data", "Descrição", "Valor"],
    sampleRows: [...],
    totalRows: 150,
    columnMapping: null, // ou { date: "Data", amount: "Valor" }
    validationResult: null, // ou { isValid: true, errors: [], ... }
    notes: null,
    createdAt: "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. **POST /financial/map-document/:id**
Define mapeamento de colunas

**Request:**
```typescript
{
  columnMapping: {
    date: "Data",           // OBRIGATÓRIO
    description: "Descrição", // Opcional
    category: "Categoria",    // Opcional
    amount: "Valor",          // OBRIGATÓRIO
    type: "Tipo"             // Opcional
  }
}
```

**Response:**
```typescript
{
  success: true,
  message: "Mapeamento definido com sucesso",
  documentId: "uuid"
}
```

---

### 5. **POST /financial/validate-document/:id**
Valida dados do documento

**Response:**
```typescript
{
  success: true,
  documentId: "uuid",
  isValid: true,
  validTransactions: 145,
  invalidTransactions: 5,
  errors: [
    { row: 10, field: "amount", message: "Valor inválido: abc" },
    { row: 25, field: "date", message: "Data é obrigatória" }
  ],
  warnings: [
    { row: 50, field: "description", message: "Descrição vazia" }
  ],
  message: "Validação concluída: 145 transações válidas, 2 avisos"
}
```

---

### 6. **POST /financial/approve-document/:id**
Aprova e importa transações

**Response:**
```typescript
{
  success: true,
  message: "Documento aprovado! 145 transações importadas",
  documentId: "uuid",
  transactionsImported: 145
}
```

---

### 7. **POST /financial/reject-document/:id**
Rejeita documento

**Request:**
```typescript
{
  notes: "Dados inconsistentes, refazer análise" // Opcional
}
```

**Response:**
```typescript
{
  success: true,
  message: "Documento rejeitado",
  documentId: "uuid"
}
```

---

## 🗄️ Estrutura de Banco de Dados

### Tabela: `pending_documents`

```sql
CREATE TABLE pending_documents (
  id UUID PRIMARY KEY,
  company_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL, -- UPLOADED, MAPPED, VALIDATED, APPROVED, REJECTED
  raw_data JSONB NOT NULL,     -- { headers, rows, totalRows }
  column_mapping JSONB,         -- { date: "Data", amount: "Valor", ... }
  validation_result JSONB,      -- { isValid, errors, warnings, ... }
  notes TEXT,
  approved_by VARCHAR(100),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pending_docs_company ON pending_documents(company_id);
CREATE INDEX idx_pending_docs_status ON pending_documents(status);
CREATE INDEX idx_pending_docs_user ON pending_documents(user_id);
```

---

## 💡 Casos de Uso

### Caso 1: Upload com Mapeamento Automático
```bash
# 1. Upload
POST /financial/upload-raw
Response: suggestedMapping presente

# 2. Aceitar sugestão e mapear
POST /financial/map-document/:id
Body: { columnMapping: <suggestedMapping> }

# 3. Validar
POST /financial/validate-document/:id
Response: isValid: true

# 4. Aprovar
POST /financial/approve-document/:id
Response: 150 transações importadas
```

### Caso 2: Upload com Mapeamento Manual
```bash
# 1. Upload
POST /financial/upload-raw

# 2. Ver detalhes (headers disponíveis)
GET /financial/pending-documents/:id

# 3. Mapear manualmente
POST /financial/map-document/:id
Body: { columnMapping: { date: "DT_TRANSACAO", amount: "VL_TOTAL" } }

# 4. Validar
POST /financial/validate-document/:id

# 5. Aprovar
POST /financial/approve-document/:id
```

### Caso 3: Validação com Erros
```bash
# 1. Upload
POST /financial/upload-raw

# 2. Mapear
POST /financial/map-document/:id

# 3. Validar
POST /financial/validate-document/:id
Response: isValid: false, errors: [...]

# 4. Rejeitar documento
POST /financial/reject-document/:id
Body: { notes: "Erros de formatação nas linhas 10, 25" }
```

---

## 🎨 Interface do Usuário (Sugestão)

### Tela 1: Lista de Documentos Pendentes
```
┌────────────────────────────────────────────────────┐
│  📂 Documentos Pendentes                           │
├────────────────────────────────────────────────────┤
│  vendas_janeiro.xlsx          [UPLOADED] ⏳        │
│  150 linhas                    15/01/2024          │
│  [Ver] [Mapear]                                    │
├────────────────────────────────────────────────────┤
│  despesas_fevereiro.xlsx      [VALIDATED] ✅       │
│  85 linhas                     16/01/2024          │
│  [Ver] [Aprovar] [Rejeitar]                        │
└────────────────────────────────────────────────────┘
```

### Tela 2: Mapeamento de Colunas
```
┌────────────────────────────────────────────────────┐
│  📊 vendas_janeiro.xlsx - Mapear Colunas           │
├────────────────────────────────────────────────────┤
│  Preview das colunas:                              │
│  ┌─────────┬────────────┬──────────┬──────────┐   │
│  │ Data    │ Descrição  │ Valor    │ Tipo     │   │
│  ├─────────┼────────────┼──────────┼──────────┤   │
│  │ 15/01   │ Venda A    │ 1500.50  │ Receita  │   │
│  │ 16/01   │ Compra B   │ -350.75  │ Despesa  │   │
│  └─────────┴────────────┴──────────┴──────────┘   │
│                                                     │
│  Mapeamento:                                       │
│  Data       : [Data       ▼] *Obrigatório          │
│  Descrição  : [Descrição  ▼]                       │
│  Valor      : [Valor      ▼] *Obrigatório          │
│  Categoria  : [Nenhuma    ▼]                       │
│  Tipo       : [Tipo       ▼]                       │
│                                                     │
│  [Cancelar]        [Salvar e Validar]              │
└────────────────────────────────────────────────────┘
```

### Tela 3: Validação
```
┌────────────────────────────────────────────────────┐
│  ✅ Validação Concluída                             │
├────────────────────────────────────────────────────┤
│  145 transações válidas ✓                          │
│  5 transações inválidas ✗                          │
│  2 avisos ⚠                                        │
│                                                     │
│  Erros:                                            │
│  • Linha 10: Valor inválido: "abc"                 │
│  • Linha 25: Data é obrigatória                    │
│                                                     │
│  Avisos:                                           │
│  • Linha 50: Descrição vazia                       │
│                                                     │
│  [Rejeitar]        [Aprovar Mesmo Assim]           │
└────────────────────────────────────────────────────┘
```

---

## 🔧 Próximos Passos (Implementação)

### ✅ Já Implementado
- [x] Domínio (Entities, Value Objects, Ports)
- [x] Use Cases (Upload, Map, Validate, Approve, List)
- [x] Adapters (ExcelAnalyzer, Repository)
- [x] Schemas (TypeORM)

### ⏳ Pendente
- [ ] Controller com endpoints REST
- [ ] Testes unitários
- [ ] Migration do banco de dados
- [ ] Frontend (React components)
- [ ] Documentação Swagger

---

## 🚀 Vantagens do Novo Sistema

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Flexibilidade** | Estrutura fixa | Qualquer estrutura |
| **Validação** | Direto no import | Validação prévia com feedback |
| **Controle** | Importa imediatamente | Aprovação manual |
| **Auditoria** | Nenhuma | Histórico completo |
| **Erros** | Falha total | Feedback detalhado por linha |

---

## 📝 Notas Técnicas

### Mapeamento Automático
O sistema tenta identificar colunas baseado em nomes comuns:
- Data: `data`, `date`, `dt`
- Valor: `valor`, `amount`, `value`, `price`, `preço`
- Descrição: `descrição`, `descricao`, `description`, `desc`
- Categoria: `categoria`, `category`, `cat`
- Tipo: `tipo`, `type`

### Validação
Valida usando Value Objects do domínio:
- `Money`: valores numéricos válidos
- `Category`: strings não vazias
- `TransactionType`: RECEITA ou DESPESA
- `Date`: formatos aceitos: ISO, DD/MM/YYYY, Excel serial

### Performance
- Raw data armazenado como JSONB (PostgreSQL)
- Índices em company_id, status, user_id
- Processamento em batch na aprovação

---

## 🎯 Próxima Fase: Templates

Funcionalidade futura: salvar mapeamentos como templates reutilizáveis

```typescript
{
  templateName: "Formato Banco XYZ",
  columnMapping: { date: "DT_TRANS", amount: "VALOR" }
}
```

Permitir: "Aplicar template 'Formato Banco XYZ' ao novo documento"
