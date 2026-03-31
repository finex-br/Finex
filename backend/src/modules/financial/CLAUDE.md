# Financial Module

## Domínio

Upload e processamento de dados financeiros via Excel. Dois sistemas coexistem:

### Sistema Original (Upload Direto)
`ProcessExcelUseCase` → processa Excel e persiste FinancialTransaction direto.

### Sistema Novo (Upload Flexível com Staging)
Fluxo de aprovação com máquina de estados:
```
UPLOADED → MAPPED → VALIDATED → APPROVED (estado final)
                                → REJECTED (estado final)
```
Cada estado pode transicionar para REJECTED. Transições inválidas retornam `Result.fail`.

### Entidades
- **FinancialTransaction** — transação financeira persistida (aggregate root)
- **PendingDocument** — documento em staging aguardando aprovação

### Value Objects
- `DocumentStatus` — enum com máquina de estados (UPLOADED→MAPPED→VALIDATED→APPROVED/REJECTED)
- `ColumnMapping` — mapeamento de colunas do Excel para campos do sistema
- `Money` — valor monetário
- `Category` — categoria da transação
- `TransactionType` — tipo (receita/despesa)
- `PeriodFilter` — filtro temporal (WEEK, MONTH, QUARTER, SEMESTER, YEAR, CUSTOM)

## Ports (Domain Interfaces)
- `IExcelProcessor` — processamento de Excel (impl: ExcelProcessorAdapter)
- `IExcelAnalyzer` — análise de colunas do Excel (impl: ExcelAnalyzerAdapter)
- `IFinancialRepository` — persistência TypeORM
- `IPendingDocumentRepository` — staging (usa tabela financial_uploads)

## Controllers
- `FinancialController` — upload direto + consulta de dados agregados
- `PendingDocumentController` — fluxo de aprovação (upload, map, validate, approve/reject)
