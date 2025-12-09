// Script para criar planilha Excel de exemplo
// Execute: node scripts/create-sample-excel.js

import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dados de exemplo
const sampleData = [
  { Data: '2024-01-15', Descrição: 'Venda de Produtos', Categoria: 'Vendas', Valor: 5000, Tipo: 'Receita' },
  { Data: '2024-01-20', Descrição: 'Aluguel', Categoria: 'Fixos', Valor: -1500, Tipo: 'Despesa' },
  { Data: '2024-01-25', Descrição: 'Salários', Categoria: 'Pessoal', Valor: -3000, Tipo: 'Despesa' },
  { Data: '2024-02-10', Descrição: 'Prestação de Serviços', Categoria: 'Serviços', Valor: 7500, Tipo: 'Receita' },
  { Data: '2024-02-15', Descrição: 'Fornecedores', Categoria: 'Compras', Valor: -2000, Tipo: 'Despesa' },
  { Data: '2024-02-20', Descrição: 'Aluguel', Categoria: 'Fixos', Valor: -1500, Tipo: 'Despesa' },
  { Data: '2024-02-28', Descrição: 'Venda de Produtos', Categoria: 'Vendas', Valor: 6000, Tipo: 'Receita' },
  { Data: '2024-03-05', Descrição: 'Comissões', Categoria: 'Pessoal', Valor: -1200, Tipo: 'Despesa' },
  { Data: '2024-03-10', Descrição: 'Consultoria', Categoria: 'Serviços', Valor: 4500, Tipo: 'Receita' },
  { Data: '2024-03-15', Descrição: 'Marketing', Categoria: 'Marketing', Valor: -800, Tipo: 'Despesa' },
  { Data: '2024-03-20', Descrição: 'Aluguel', Categoria: 'Fixos', Valor: -1500, Tipo: 'Despesa' },
  { Data: '2024-03-25', Descrição: 'Venda de Produtos', Categoria: 'Vendas', Valor: 8500, Tipo: 'Receita' },
  { Data: '2024-04-01', Descrição: 'Utilities', Categoria: 'Fixos', Valor: -600, Tipo: 'Despesa' },
  { Data: '2024-04-10', Descrição: 'Prestação de Serviços', Categoria: 'Serviços', Valor: 9000, Tipo: 'Receita' },
  { Data: '2024-04-15', Descrição: 'Fornecedores', Categoria: 'Compras', Valor: -2500, Tipo: 'Despesa' },
];

// Criar workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData);

// Adicionar a planilha ao workbook
XLSX.utils.book_append_sheet(wb, ws, 'Fluxo de Caixa');

// Salvar o arquivo
const outputPath = join(__dirname, '..', 'public', 'exemplo-financeiro.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Planilha de exemplo criada em:', outputPath);
