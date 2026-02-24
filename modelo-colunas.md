## ESTRUTURA DA TABELA DE LANÇAMENTOS FINANCEIROS

O arquivo modelo de importação deve conter exatamente as seguintes colunas, nessa ordem:

| Coluna                      | Tipo de Dado    | Descrição |
|-----------------------------|-----------------|-----------|
| id_lancamento               | varchar         | Identificador único do lançamento financeiro |
| tipo_movimento              | varchar         | Entrada ou saída de recursos |
| categoria_movimento         | varchar         | Operacional, financeiro ou investimento |
| descricao                   | varchar         | Descrição livre do lançamento |
| data_competencia            | date            | Data de impacto no resultado econômico (DRE) |
| data_vencimento             | date            | Data acordada para pagamento ou recebimento |
| data_pagamento_recebimento  | date            | Data em que o caixa foi efetivamente impactado |
| periodo_referencia          | varchar         | Mês e ano no formato MM-YYYY |
| valor_bruto                 | decimal(15,2)   | Valor original antes de ajustes |
| juros_multas                | decimal(15,2)   | Juros ou multas aplicados |
| descontos                   | decimal(15,2)   | Descontos concedidos |
| valor_liquido               | decimal(15,2)   | Valor final após juros e descontos |
| valor_pago_recebido         | decimal(15,2)   | Valor efetivamente pago ou recebido |
| conta_bancaria              | varchar         | Conta bancária ou caixa utilizado |
| tipo_conta                  | varchar         | conta_corrente, caixa ou credito |
| forma_pagamento             | varchar         | pix, boleto, cartao ou transferencia |
| status_pagamento            | varchar         | aberto, pago ou recebido |
| plano_contas_dre            | varchar         | receita, custo ou despesa |
| subconta_dre                | varchar         | Subclassificação do plano de contas |
| centro_custo                | varchar         | Área ou departamento responsável |
| nucleo_negocio              | varchar         | Linha de receita, produto ou unidade de negócio |
| numero_parcela              | integer         | Número da parcela atual |
| total_parcelas              | integer         | Total de parcelas previstas |
| recorrente                  | boolean         | true/false — indica se é recorrente |
| contraparte_nome            | varchar         | Nome do cliente ou fornecedor |
| observacoes                 | varchar         | Observações adicionais |

### Instruções de implementação:

1. Atualizar o campo "Formato esperado:" na página de Importar Dados com todas as colunas acima.
2. O botão "Baixar planilha modelo" deve gerar um arquivo .xlsx com apenas a linha de cabeçalho contendo os nomes exatos das colunas acima, sem nenhum dado de exemplo.
3. Na validação do arquivo importado pelo usuário, mapear e validar cada campo conforme o tipo de dado especificado (varchar, date, decimal, integer, boolean).