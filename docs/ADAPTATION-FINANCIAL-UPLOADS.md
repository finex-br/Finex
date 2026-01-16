# ✅ ADAPTAÇÃO CONCLUÍDA: Usando financial_uploads

## 🎯 O QUE FOI FEITO

Sistema adaptado para usar a tabela **`financial_uploads`** existente ao invés de criar uma nova tabela.

---

## 📦 MUDANÇAS IMPLEMENTADAS

### **1. Migration SQL**
**Arquivo**: `backend/scripts/add-staging-columns-to-financial-uploads.sql`

Adiciona colunas à tabela existente:
```sql
ALTER TABLE financial_uploads 
  ADD COLUMN raw_data jsonb,           -- Headers e rows do Excel
  ADD COLUMN column_mapping jsonb,     -- Mapeamento definido pelo admin (rascunho)
  ADD COLUMN validation_result jsonb;  -- Erros e warnings (rascunho)
```

**Nota**: `approved_by` e `approved_at` **não são necessários** - usa `audit_logs` para rastrear aprovações!

Novos status:
- `UPLOADED` - Usuário fez upload, aguardando admin
- `MAPPED` - Admin mapeou colunas
- `VALIDATED` - Dados validados, pronto para aprovar
- `PROCESSING` - Sendo inserido em financial_data
- `DONE` - Concluído
- `ERROR` - Erro
- `REJECTED` - Rejeitado pelo admin

### **2. Schema TypeORM**
**Arquivo**: `infrastructure/persistence/typeorm/financial-upload.schema.ts`

Nova schema mapeando `financial_uploads` com as colunas adicionais.

### **3. Repository Adaptado**
**Arquivo**: `infrastructure/persistence/typeorm/typeorm-financial-upload.repository.ts`

Implementa `IPendingDocumentRepository` usando `financial_uploads`.

Mapeamento de status:
- Domínio `APPROVED` → DB `DONE`
- DB `PROCESSING` → Domínio `VALIDATED`
- DB `ERROR` → Domínio `REJECTED`

### **4. Entidade de Domínio**
**Arquivo**: `domain/entities/pending-document.ts`

Adicionado campo `storagePath` para armazenar caminho do arquivo.

### **5. Module Atualizado**
**Arquivo**: `financial.module.ts`

- Registra `FinancialUploadSchema` ao invés de `PendingDocumentSchema`
- Usa `TypeORMFinancialUploadRepository`

---

## 🔥 FLUXO COMPLETO

```
1. USUÁRIO faz upload
   POST /financial/pending-documents/upload
   → Cria registro em financial_uploads
   → status = 'UPLOADED'
   → raw_data = { headers, rows, totalRows }
   → storage_path = caminho do arquivo

2. Admin vê documentos pendentes
   GET /financial/pending-documents
   → Retorna uploads com status UPLOADED/MAPPED/VALIDATED

3. Admin vê preview
   GET /financial/pending-documents/:id
   → Retorna headers e sample rows

4. Admin mapeia colunas
   POST /financial/pending-documents/:id/map
   Body: { columnMapping: { date: "Data", amount: "Valor" } }
   → Atualiza column_mapping
   → status = 'MAPPED'

5. Admin valida
   POST /financial/pending-documents/:id/validate
   → Valida linha por linha
   → Atualiza validation_result
   → status = 'VALIDATED'

6. Admin aprova
   POST /financial/pending-documents/:id/approve
   → Processa com mapeamento
   → Insere em financial_data (com upload_id)
   → Registra em audit_logs (quem aprovou e quando)
   → status = 'DONE'

7. Usuário vê gráficos
   GET /financial/data
   → Busca em financial_data (onde upload_id aponta para este upload)
```

---

## 📊 TABELAS ENVOLVIDAS

### **financial_uploads** (Staging)
- Armazena uploads pendentes
- Contém raw_data, column_mapping, validation_result
- Status: UPLOADED → MAPPED → VALIDATED → DONE

### **financial_data** (Final)
- Transações processadas
- Campo `upload_id` aponta para `financial_uploads.id`
- Rastreabilidade: saber de qual upload veio cada transação

### **audit_logs** (Auditoria)
- Registra ações dos admins
- Exemplo: "Admin X aprovou upload Y em Z"

---

## 🚀 PRÓXIMOS PASSOS

### **1. Executar Migration**
```bash
psql -U postgres -d finex_db -f backend/scripts/add-staging-columns-to-financial-uploads.sql
```

### **2. Implementar DocumentProcessorAdapter** (CRÍTICO)
Ver `docs/PENDING-IMPLEMENTATION.md`

O método `ApproveDocumentUseCase.processDocumentWithMapping()` precisa:
- Ler raw_data
- Aplicar column_mapping
- Criar transações válidas
- Inserir em financial_data com upload_id

### **3. Testar Fluxo Completo**
```bash
# Upload
curl -X POST http://localhost:3000/financial/pending-documents/upload \
  -F "file=@test.xlsx"

# Listar
curl http://localhost:3000/financial/pending-documents

# Mapear
curl -X POST http://localhost:3000/financial/pending-documents/{id}/map \
  -H "Content-Type: application/json" \
  -d '{"columnMapping": {"date": "Data", "amount": "Valor"}}'

# Validar
curl -X POST http://localhost:3000/financial/pending-documents/{id}/validate

# Aprovar (quando implementar DocumentProcessor)
curl -X POST http://localhost:3000/financial/pending-documents/{id}/approve
```

---

## ⚠️ ARQUIVOS OBSOLETOS (Podem ser deletados)

- `pending-document.schema.ts` (substituído por financial-upload.schema.ts)
- `typeorm-pending-document.repository.ts` (substituído por typeorm-financial-upload.repository.ts)
- `create-pending-documents-table.sql` (substituído por add-staging-columns-to-financial-uploads.sql)

---

## 🎉 CONCLUSÃO

✅ Sistema adaptado para usar `financial_uploads` existente
✅ Sem criar tabelas novas
✅ Mantém rastreabilidade (upload_id)
✅ Auditoria separada (audit_logs)
✅ Admin tem controle total do fluxo

**Falta apenas**: Implementar `DocumentProcessorAdapter` para completar aprovação! 🚀
