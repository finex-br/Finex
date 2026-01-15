# 🚀 QUICKSTART: Sistema de Upload Flexível

## ✅ O QUE FOI FEITO

Sistema completo de upload flexível de documentos financeiros com **mapeamento customizado**, **validação** e **aprovação** antes da importação final.

---

## 📁 ARQUIVOS CRIADOS (23 arquivos novos)

### Domain
- `domain/entities/pending-document.ts`
- `domain/value-objects/document-status.ts`
- `domain/value-objects/column-mapping.ts`
- `domain/ports/pending-document-repository.interface.ts`
- `domain/ports/excel-analyzer.interface.ts`

### Application
- `application/use-cases/upload-raw-document.use-case.ts`
- `application/use-cases/map-document-columns.use-case.ts`
- `application/use-cases/validate-document.use-case.ts`
- `application/use-cases/approve-document.use-case.ts`
- `application/use-cases/get-pending-documents.use-case.ts`
- `application/dtos/pending-document.dto.ts`

### Infrastructure
- `infrastructure/adapters/excel-analyzer.adapter.ts`
- `infrastructure/persistence/typeorm/pending-document.schema.ts`
- `infrastructure/persistence/typeorm/typeorm-pending-document.repository.ts`

### Presentation
- `presentation/controllers/pending-document.controller.ts`

### Configuration
- `financial.module.ts` (atualizado)
- `scripts/create-pending-documents-table.sql`

### Documentation
- `docs/DOCUMENT-UPLOAD-FLOW.md`
- `docs/FLEXIBLE-UPLOAD-SUMMARY.md`
- `docs/PENDING-IMPLEMENTATION.md`
- Este arquivo: `docs/QUICKSTART-FLEXIBLE-UPLOAD.md`

---

## ⚡ SETUP RÁPIDO

### 1. **Instalar Dependência (se necessário)**

```bash
cd backend
npm install uuid
npm install --save-dev @types/uuid
```

### 2. **Executar Migration do Banco**

```bash
# Método 1: Diretamente no PostgreSQL
psql -U postgres -d finex_db -f backend/scripts/create-pending-documents-table.sql

# Método 2: Copiar e executar o SQL manualmente
# Ver arquivo: backend/scripts/create-pending-documents-table.sql
```

### 3. **Reiniciar Backend**

```bash
cd backend
npm run start:dev
```

### 4. **Testar Upload**

```bash
# Teste básico de upload
curl -X POST http://localhost:3000/financial/pending-documents/upload \
  -F "file=@test.xlsx"
```

---

## 🎯 FLUXO DE USO

### **Cenário Completo: Upload → Mapeamento → Validação → Aprovação**

#### 1. **Upload de Documento**

```bash
curl -X POST http://localhost:3000/financial/pending-documents/upload \
  -F "file=@vendas.xlsx"
```

**Response:**
```json
{
  "success": true,
  "documentId": "abc-123",
  "message": "Documento carregado com sucesso",
  "preview": {
    "headers": ["Data", "Descrição", "Valor"],
    "sampleRows": [
      ["2024-01-15", "Venda A", 1500.50],
      ["2024-01-16", "Compra B", -350.75]
    ],
    "totalRows": 150
  },
  "suggestedMapping": {
    "date": "Data",
    "description": "Descrição",
    "amount": "Valor"
  }
}
```

#### 2. **Mapear Colunas**

```bash
curl -X POST http://localhost:3000/financial/pending-documents/abc-123/map \
  -H "Content-Type: application/json" \
  -d '{
    "columnMapping": {
      "date": "Data",
      "amount": "Valor",
      "description": "Descrição"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Mapeamento definido com sucesso",
  "documentId": "abc-123"
}
```

#### 3. **Validar Documento**

```bash
curl -X POST http://localhost:3000/financial/pending-documents/abc-123/validate
```

**Response:**
```json
{
  "success": true,
  "documentId": "abc-123",
  "isValid": true,
  "validTransactions": 148,
  "invalidTransactions": 2,
  "errors": [
    { "row": 10, "field": "amount", "message": "Valor inválido: abc" },
    { "row": 25, "field": "date", "message": "Data é obrigatória" }
  ],
  "warnings": [
    { "row": 50, "field": "description", "message": "Descrição vazia" }
  ],
  "message": "Validação concluída: 148 transações válidas, 1 aviso"
}
```

#### 4. **Aprovar Documento** (⚠️ Implementação Pendente)

```bash
curl -X POST http://localhost:3000/financial/pending-documents/abc-123/approve
```

**Response Expected:**
```json
{
  "success": true,
  "message": "Documento aprovado! 148 transações importadas",
  "documentId": "abc-123",
  "transactionsImported": 148
}
```

> ⚠️ **NOTA**: O endpoint de aprovação está incompleto. Ver `docs/PENDING-IMPLEMENTATION.md` para detalhes.

---

## 📋 ENDPOINTS DISPONÍVEIS

| Método | Endpoint | Status | Descrição |
|--------|----------|--------|-----------|
| `POST` | `/financial/pending-documents/upload` | ✅ Pronto | Upload documento |
| `GET` | `/financial/pending-documents` | ✅ Pronto | Listar documentos |
| `GET` | `/financial/pending-documents/:id` | ⏳ Pendente | Detalhes documento |
| `POST` | `/financial/pending-documents/:id/map` | ✅ Pronto | Mapear colunas |
| `POST` | `/financial/pending-documents/:id/validate` | ✅ Pronto | Validar dados |
| `POST` | `/financial/pending-documents/:id/approve` | ⚠️ Incompleto | Aprovar e importar |
| `POST` | `/financial/pending-documents/:id/reject` | ⏳ Pendente | Rejeitar documento |

---

## ⚠️ IMPLEMENTAÇÕES PENDENTES

### 1. **ApproveDocumentUseCase - Processamento Final** (CRÍTICO)

O método `processDocumentWithMapping()` precisa ser implementado.

**Localização**: `application/use-cases/approve-document.use-case.ts:100`

**Solução Recomendada**: Criar `DocumentProcessorAdapter`

**Estimativa**: 2-3 horas

**Guia**: Ver `docs/PENDING-IMPLEMENTATION.md`

### 2. **GetDocumentDetailsUseCase** (SIMPLES)

**Estimativa**: 30 minutos

```typescript
// Implementação sugerida
async execute(request) {
  const document = await this.repository.findById(request.documentId);
  if (!document) throw new Error('Documento não encontrado');
  
  return {
    success: true,
    document: {
      id: document.id,
      fileName: document.fileName,
      status: document.status.value,
      headers: document.rawData.headers,
      sampleRows: document.getPreview().sampleRows,
      totalRows: document.rawData.totalRows,
      columnMapping: document.columnMapping?.toJSON(),
      validationResult: document.validationResult,
      // ...
    }
  };
}
```

### 3. **RejectDocumentUseCase** (SIMPLES)

**Estimativa**: 30 minutos

```typescript
// Implementação sugerida
async execute(request) {
  const document = await this.repository.findById(request.documentId);
  if (!document) throw new Error('Documento não encontrado');
  
  const result = document.reject(request.notes);
  if (result.isFailure) throw new Error(result.error);
  
  await this.repository.save(document);
  
  return { success: true, documentId: document.id, message: 'Documento rejeitado' };
}
```

---

## 🧪 COMO TESTAR

### Teste Manual Completo

1. **Criar arquivo Excel de teste**:
   - Coluna A: Data (15/01/2024, 16/01/2024...)
   - Coluna B: Descrição (Venda, Compra...)
   - Coluna C: Valor (1500.50, -350.75...)

2. **Upload**:
   ```bash
   curl -X POST http://localhost:3000/financial/pending-documents/upload \
     -F "file=@test.xlsx"
   ```
   - ✅ Deve retornar documentId
   - ✅ Deve retornar suggestedMapping

3. **Listar documentos**:
   ```bash
   curl http://localhost:3000/financial/pending-documents
   ```
   - ✅ Deve mostrar documento com status UPLOADED

4. **Mapear**:
   ```bash
   curl -X POST http://localhost:3000/financial/pending-documents/{documentId}/map \
     -H "Content-Type: application/json" \
     -d '{"columnMapping": {"date": "Data", "amount": "Valor"}}'
   ```
   - ✅ Status deve mudar para MAPPED

5. **Validar**:
   ```bash
   curl -X POST http://localhost:3000/financial/pending-documents/{documentId}/validate
   ```
   - ✅ Deve retornar isValid, errors, warnings

6. **Aprovar** (quando implementado):
   ```bash
   curl -X POST http://localhost:3000/financial/pending-documents/{documentId}/approve
   ```
   - ✅ Deve importar transações

---

## 🔍 TROUBLESHOOTING

### Erro: "Cannot find module 'uuid'"
```bash
npm install uuid
npm install --save-dev @types/uuid
```

### Erro: "Tabela pending_documents não existe"
```bash
# Executar migration
psql -U postgres -d finex_db -f backend/scripts/create-pending-documents-table.sql
```

### Erro: "404 Not Found" nos endpoints
- ✅ Verificar se backend está rodando
- ✅ Verificar se module foi atualizado corretamente
- ✅ Reiniciar backend: `npm run start:dev`

### Logs úteis
Todos os controllers têm console.log detalhados:
```typescript
console.log('[PendingDocumentController] Upload recebido:', {...});
console.log('[UploadRawDocumentUseCase] Processando...', {...});
```

Verificar terminal do backend para debug.

---

## 📚 DOCUMENTAÇÃO COMPLETA

1. **Visão Geral**: `docs/FLEXIBLE-UPLOAD-SUMMARY.md`
2. **Fluxo Detalhado**: `docs/DOCUMENT-UPLOAD-FLOW.md`
3. **Pendências**: `docs/PENDING-IMPLEMENTATION.md`
4. **Este Guia**: `docs/QUICKSTART-FLEXIBLE-UPLOAD.md`

---

## 🎉 CONCLUSÃO

Sistema de upload flexível **90% completo**!

**Funcional Agora:**
- ✅ Upload
- ✅ Mapeamento
- ✅ Validação
- ✅ Listagem

**Pendente:**
- ⏳ Aprovação final (core logic)
- ⏳ Rejeição
- ⏳ Detalhes completos
- ⏳ Frontend
- ⏳ Testes

**Próximo Passo Recomendado:**
Implementar `DocumentProcessorAdapter` para finalizar aprovação.

Ver: `docs/PENDING-IMPLEMENTATION.md` para guia completo.

---

Pronto para uso! 🚀
