# 🚧 IMPLEMENTAÇÃO PENDENTE: ApproveDocumentUseCase

## ❗ PROBLEMA

O `ApproveDocumentUseCase` está incompleto. Precisa re-processar o documento aplicando o mapeamento customizado definido pelo usuário.

---

## 📍 LOCALIZAÇÃO

**Arquivo**: `backend/src/modules/financial/application/use-cases/approve-document.use-case.ts`

**Método**: `processDocumentWithMapping()`

```typescript
private async processDocumentWithMapping(document: any) {
  // TODO: Implementar lógica de re-processamento com mapeamento custom
  throw new Error('Implementação de processamento com mapeamento custom ainda não disponível');
}
```

---

## 🎯 SOLUÇÃO PROPOSTA

### **Opção 1: Adapter Customizado (Recomendado)**

Criar um novo adapter que processa dados brutos + mapeamento diretamente:

```typescript
// Novo arquivo: document-processor.adapter.ts
@Injectable()
export class DocumentProcessorAdapter {
  async processWithMapping(
    rawData: { headers: string[], rows: any[][] },
    columnMapping: ColumnMapping,
    companyId: string
  ): Promise<FinancialTransaction[]> {
    const transactions: FinancialTransaction[] = [];
    
    // Criar índice de colunas
    const getColumnIndex = (columnName?: string): number => {
      if (!columnName) return -1;
      return rawData.headers.indexOf(columnName);
    };

    const dateIndex = getColumnIndex(columnMapping.date);
    const amountIndex = getColumnIndex(columnMapping.amount);
    const descriptionIndex = getColumnIndex(columnMapping.description);
    const categoryIndex = getColumnIndex(columnMapping.category);
    const typeIndex = getColumnIndex(columnMapping.type);

    // Processar cada linha
    for (const row of rawData.rows) {
      try {
        // Extrair valores
        const dateValue = row[dateIndex];
        const amountValue = row[amountIndex];
        const descriptionValue = row[descriptionIndex] || 'Sem descrição';
        const categoryValue = row[categoryIndex] || 'Outros';
        const typeValue = row[typeIndex];

        // Parsear data
        const date = this.parseDate(dateValue);
        if (!date) continue; // Pular se data inválida

        // Parsear valor
        const amount = this.parseNumber(amountValue);
        if (amount === null) continue; // Pular se valor inválido

        // Criar Value Objects
        const moneyResult = Money.create(amount);
        if (moneyResult.isFailure) continue;

        const categoryResult = Category.create(categoryValue);
        if (categoryResult.isFailure) continue;

        // Determinar tipo
        let transactionType: TransactionType;
        if (typeValue) {
          const typeString = typeValue.toString().toLowerCase();
          if (typeString.includes('receit') || typeString.includes('revenue')) {
            transactionType = TransactionType.RECEITA;
          } else if (typeString.includes('despes') || typeString.includes('expense')) {
            transactionType = TransactionType.DESPESA;
          } else {
            transactionType = amount >= 0 ? TransactionType.RECEITA : TransactionType.DESPESA;
          }
        } else {
          transactionType = amount >= 0 ? TransactionType.RECEITA : TransactionType.DESPESA;
        }

        // Criar transação
        const transactionResult = FinancialTransaction.create({
          companyId,
          date,
          description: descriptionValue,
          amount: moneyResult.getValue(),
          type: transactionType,
          category: categoryResult.getValue(),
          competenceDate: date,
          paymentDate: date,
        });

        if (transactionResult.isSuccess) {
          transactions.push(transactionResult.getValue());
        }
      } catch (error) {
        // Log e continuar
        console.warn('Erro ao processar linha:', error.message);
      }
    }

    return transactions;
  }

  private parseDate(value: any): Date | null {
    // Mesma implementação do ValidateDocumentUseCase
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
      const date = new Date((value - 25569) * 86400 * 1000);
      return isNaN(date.getTime()) ? null : date;
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date;
      const parts = value.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }
    }
    return null;
  }

  private parseNumber(value: any): number | null {
    // Mesma implementação do ValidateDocumentUseCase
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }
}
```

### **Implementação no ApproveDocumentUseCase**

```typescript
// Atualizar constructor
constructor(
  private pendingDocumentRepository: IPendingDocumentRepository,
  private financialRepository: IFinancialRepository,
  private documentProcessor: DocumentProcessorAdapter,  // Novo
) {}

// Atualizar método
private async processDocumentWithMapping(document: PendingDocument) {
  if (!document.columnMapping) {
    throw new Error('Documento não possui mapeamento de colunas');
  }

  const transactions = await this.documentProcessor.processWithMapping(
    document.rawData,
    document.columnMapping,
    document.companyId,
  );

  return transactions;
}
```

---

### **Opção 2: Modificar ExcelProcessorAdapter**

Modificar o adapter existente para aceitar mapeamento opcional:

```typescript
// Modificar interface
export interface IExcelProcessor {
  processExcelFile(
    fileBuffer: Buffer,
    companyId: string,
    columnMapping?: ColumnMapping  // Novo parâmetro opcional
  ): Promise<FinancialTransaction[]>;
}

// Implementar lógica no adapter
async processExcelFile(
  fileBuffer: Buffer,
  companyId: string,
  columnMapping?: ColumnMapping
): Promise<FinancialTransaction[]> {
  // Se tiver mapeamento, usar ele
  if (columnMapping) {
    // Usar índices do mapeamento ao invés de detectar automaticamente
    const columnMap = {
      data: this.getExactColumnIndex(headers, columnMapping.date),
      descricao: this.getExactColumnIndex(headers, columnMapping.description),
      // ...
    };
  } else {
    // Lógica atual (detecção automática)
    const columnMap = {
      data: this.findColumnIndex(headers, ['data', 'date']),
      // ...
    };
  }
  
  // Resto da lógica igual
}
```

---

## 🎯 RECOMENDAÇÃO

**Use Opção 1 (DocumentProcessorAdapter)** porque:

✅ Mais limpo - separação de responsabilidades
✅ Não modifica código existente (backward compatible)
✅ Mais fácil de testar
✅ Reutilizável para outros casos

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Opção 1 (Recomendada)

- [ ] Criar `document-processor.adapter.ts`
- [ ] Implementar métodos `processWithMapping()`, `parseDate()`, `parseNumber()`
- [ ] Criar interface `IDocumentProcessor`
- [ ] Atualizar `ApproveDocumentUseCase` para usar o novo adapter
- [ ] Registrar adapter no `FinancialModule`
- [ ] Criar testes unitários
- [ ] Testar fluxo completo (upload → map → validate → approve)

### Opção 2 (Alternativa)

- [ ] Modificar `IExcelProcessor` interface
- [ ] Atualizar `ExcelProcessorAdapter.processExcelFile()`
- [ ] Adicionar lógica de mapeamento customizado
- [ ] Atualizar todos os lugares que chamam `processExcelFile()`
- [ ] Criar testes
- [ ] Testar fluxo completo

---

## 🧪 TESTES NECESSÁRIOS

```typescript
describe('ApproveDocumentUseCase', () => {
  it('deve processar documento com mapeamento customizado', async () => {
    // Arrange
    const document = createMockDocument({
      rawData: {
        headers: ['DT_TRANS', 'VL_TOTAL', 'DESC'],
        rows: [
          ['2024-01-15', 1500.50, 'Venda A'],
          ['2024-01-16', -350.75, 'Compra B']
        ]
      },
      columnMapping: {
        date: 'DT_TRANS',
        amount: 'VL_TOTAL',
        description: 'DESC'
      }
    });

    // Act
    const result = await useCase.execute({
      documentId: document.id,
      userId: 'user-123'
    });

    // Assert
    expect(result.transactionsImported).toBe(2);
    expect(financialRepository.saveBatch).toHaveBeenCalledTimes(1);
  });
});
```

---

## ⏱️ ESTIMATIVA

- **Opção 1**: 2-3 horas
- **Opção 2**: 4-5 horas (maior impacto)
- **Testes**: 1-2 horas

**Total estimado**: 3-5 horas para implementação completa

---

## 🚀 PRÓXIMAS AÇÕES

1. Escolher opção (recomendo Opção 1)
2. Implementar adapter
3. Atualizar ApproveDocumentUseCase
4. Testar manualmente
5. Criar testes automatizados
6. Documentar mudanças

---

## 📝 OUTROS PENDENTES MENORES

### 1. GetDocumentDetailsUseCase
```typescript
// Simples - apenas buscar e retornar
async execute(request) {
  const document = await this.repository.findById(request.documentId);
  if (!document) throw new Error('Not found');
  return { success: true, document: this.toDTO(document) };
}
```

### 2. RejectDocumentUseCase
```typescript
// Simples - chamar método reject da entidade
async execute(request) {
  const document = await this.repository.findById(request.documentId);
  if (!document) throw new Error('Not found');
  const result = document.reject(request.notes);
  if (result.isFailure) throw new Error(result.error);
  await this.repository.save(document);
  return { success: true, documentId: document.id };
}
```

**Estimativa**: 30 minutos cada

---

Pronto! Agora você tem um guia completo para finalizar a implementação. 🚀
