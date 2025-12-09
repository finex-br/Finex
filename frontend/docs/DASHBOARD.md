# Dashboard Financeiro - FinEx

## 📊 Funcionalidades Implementadas

### 1. **Contexto Financeiro** (`src/context/FinancialContext.tsx`)
- Gerenciamento global de dados financeiros
- Processamento client-side de arquivos Excel usando `xlsx`
- Cálculo automático de resumos (Receita, Despesa, Lucro)
- Agrupamento de dados por mês para visualizações

### 2. **Dashboard View** (`src/views/DashboardView.tsx`)
- **KPIs Visuais:**
  - Receita Total (verde)
  - Despesas Totais (vermelho)
  - Lucro/Prejuízo (azul/laranja)
- **Gráfico de Barras Interativo:**
  - Comparativo mensal: Receitas vs Despesas
  - Usando biblioteca `recharts`
  - Tooltips formatados em R$
- **Estado Vazio:**
  - Tela amigável quando não há dados
  - Botão para importar planilha

### 3. **Upload View Atualizada** (`src/views/UploadView.tsx`)
- Interface drag-and-drop style
- Validação de tipo de arquivo (.xlsx, .xls)
- Processamento local com feedback visual
- Redirecionamento automático para dashboard após sucesso

## 🚀 Como Usar

### Passo 1: Prepare sua planilha Excel
Formato esperado:

| Data       | Descrição            | Categoria | Valor  | Tipo    |
|------------|---------------------|-----------|--------|---------|
| 2024-01-15 | Venda de Produtos   | Vendas    | 5000   | Receita |
| 2024-01-20 | Aluguel             | Fixos     | -1500  | Despesa |
| 2024-02-10 | Prestação Serviços  | Serviços  | 7500   | Receita |

**Observações:**
- As colunas podem ter nomes variados (pt/en, maiúsculo/minúsculo)
- Valores negativos ou Tipo="Despesa" indicam despesas
- Valores positivos ou Tipo="Receita" indicam receitas
- A data será usada para agrupar por mês

### Passo 2: Criar planilha de exemplo (Opcional)
```bash
# Execute na pasta frontend
node scripts/create-sample-excel.js
```
Isso criará `public/exemplo-financeiro.xlsx` para testes.

### Passo 3: Acessar a aplicação
1. Faça login ou cadastre-se
2. Acesse `/upload`
3. Selecione seu arquivo Excel
4. Clique em "Processar Planilha"
5. Aguarde o redirecionamento para `/dashboard`

## 📁 Estrutura de Arquivos

```
src/
├── context/
│   └── FinancialContext.tsx       # Contexto de dados financeiros
├── views/
│   ├── DashboardView.tsx          # Visualização do dashboard
│   ├── UploadView.tsx             # Upload de planilhas
│   ├── LoginView.tsx              # Tela de login
│   └── SignUpView.tsx             # Tela de cadastro
├── hooks/
│   ├── useLoginViewModel.ts       # Lógica de login
│   └── useSignUpViewModel.ts      # Lógica de cadastro
└── services/
    └── authService.ts             # Serviço de autenticação

scripts/
└── create-sample-excel.js         # Gera Excel de exemplo
```

## 🎨 Tecnologias Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **shadcn/ui** - Componentes de UI
- **Recharts** - Gráficos e visualizações
- **xlsx** - Processamento de Excel
- **React Router** - Navegação
- **Tailwind CSS** - Estilização

## 🔄 Fluxo de Navegação

```
Landing (/)
  ↓
Login (/login) ←→ SignUp (/signup)
  ↓ (autenticado)
Upload (/upload)
  ↓ (arquivo processado)
Dashboard (/dashboard)
```

## 📝 Notas Técnicas

### Processamento Local
- Todo o processamento do Excel acontece no navegador
- Não há envio de dados para servidor (ainda)
- Os dados ficam armazenados no contexto React
- Perfeito para MVP e testes rápidos

### Formatação de Dados
O contexto aceita diferentes formatos de colunas:
- `Data`, `data`, `DATE`, `date`
- `Descrição`, `descricao`, `DESCRIPTION`, `description`
- `Categoria`, `categoria`, `CATEGORY`, `category`
- `Valor`, `valor`, `AMOUNT`, `amount`, `Value`, `value`
- `Tipo`, `tipo`, `TYPE`, `type`

### Cálculos
- **Receita Total:** Soma de todas as entradas com tipo="receita"
- **Despesa Total:** Soma de todas as saídas com tipo="despesa" (valor absoluto)
- **Lucro:** Receita Total - Despesa Total
- **Dados Mensais:** Agrupamento por mês/ano para o gráfico

## 🚧 Próximos Passos (Sugestões)

1. **Backend Integration:**
   - Enviar Excel para API
   - Processar no servidor
   - Armazenar em banco de dados

2. **Funcionalidades Adicionais:**
   - Filtros por data
   - Exportar relatórios
   - Múltiplas planilhas
   - Edição de transações

3. **Melhorias de UX:**
   - Preview da planilha antes de processar
   - Validação mais robusta
   - Suporte a mais formatos (CSV, Google Sheets)
   - Download de template

## 🐛 Troubleshooting

**Erro: "Nenhum dado encontrado no arquivo"**
- Verifique se a planilha tem dados na primeira aba
- Confirme se as colunas estão nomeadas corretamente

**Gráfico não exibe dados**
- Verifique se a coluna "Data" está formatada corretamente
- Certifique-se de que há valores numéricos na coluna "Valor"

**Redirecionamento não funciona**
- Confirme que está autenticado (token no localStorage)
- Verifique o console do navegador para erros

---

**Desenvolvido com ❤️ para FinEx**
