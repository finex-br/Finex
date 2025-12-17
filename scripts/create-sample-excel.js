import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSampleExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Financeiro');

  // Definir largura das colunas
  worksheet.columns = [
    { key: 'data', width: 15 },
    { key: 'descricao', width: 30 },
    { key: 'categoria', width: 20 },
    { key: 'valor', width: 15 },
    { key: 'tipo', width: 15 }
  ];

  // Adicionar cabeçalhos com estilo
  const headerRow = worksheet.addRow(['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo']);
  headerRow.font = { bold: true, size: 12 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Dados de exemplo - Janeiro 2024
  const data = [
    { data: '2024-01-05', descricao: 'Venda de Produto A', categoria: 'Vendas', valor: 1500.00, tipo: 'RECEITA' },
    { data: '2024-01-10', descricao: 'Compra de Matéria Prima', categoria: 'Compras', valor: 500.00, tipo: 'DESPESA' },
    { data: '2024-01-15', descricao: 'Prestação de Serviço', categoria: 'Serviços', valor: 2000.00, tipo: 'RECEITA' },
    { data: '2024-01-20', descricao: 'Pagamento de Aluguel', categoria: 'Despesas Fixas', valor: 1200.00, tipo: 'DESPESA' },
    { data: '2024-01-25', descricao: 'Venda de Produto B', categoria: 'Vendas', valor: 1800.00, tipo: 'RECEITA' },
    
    // Fevereiro 2024
    { data: '2024-02-05', descricao: 'Venda de Produto C', categoria: 'Vendas', valor: 2200.00, tipo: 'RECEITA' },
    { data: '2024-02-10', descricao: 'Compra de Equipamento', categoria: 'Investimentos', valor: 3500.00, tipo: 'DESPESA' },
    { data: '2024-02-15', descricao: 'Consultoria Especializada', categoria: 'Serviços', valor: 2500.00, tipo: 'RECEITA' },
    { data: '2024-02-20', descricao: 'Contas de Energia', categoria: 'Despesas Fixas', valor: 450.00, tipo: 'DESPESA' },
    { data: '2024-02-28', descricao: 'Venda de Produto D', categoria: 'Vendas', valor: 1600.00, tipo: 'RECEITA' },
    
    // Março 2024
    { data: '2024-03-05', descricao: 'Venda de Produto E', categoria: 'Vendas', valor: 1900.00, tipo: 'RECEITA' },
    { data: '2024-03-10', descricao: 'Salários da Equipe', categoria: 'Pessoal', valor: 5000.00, tipo: 'DESPESA' },
    { data: '2024-03-15', descricao: 'Projeto de Design', categoria: 'Serviços', valor: 1800.00, tipo: 'RECEITA' },
    { data: '2024-03-20', descricao: 'Marketing Digital', categoria: 'Marketing', valor: 800.00, tipo: 'DESPESA' },
    { data: '2024-03-25', descricao: 'Venda de Produto F', categoria: 'Vendas', valor: 2100.00, tipo: 'RECEITA' },
    
    // Abril 2024
    { data: '2024-04-05', descricao: 'Venda de Produto G', categoria: 'Vendas', valor: 1700.00, tipo: 'RECEITA' },
    { data: '2024-04-10', descricao: 'Fornecedores', categoria: 'Compras', valor: 1200.00, tipo: 'DESPESA' },
    { data: '2024-04-15', descricao: 'Treinamento Equipe', categoria: 'Educação', valor: 900.00, tipo: 'DESPESA' },
    { data: '2024-04-20', descricao: 'Venda de Produto H', categoria: 'Vendas', valor: 2300.00, tipo: 'RECEITA' },
    { data: '2024-04-25', descricao: 'Internet e Telefone', categoria: 'Despesas Fixas', valor: 300.00, tipo: 'DESPESA' },
    
    // Novembro 2024 (trimestre recente)
    { data: '2024-11-05', descricao: 'Black Friday - Vendas', categoria: 'Vendas', valor: 5000.00, tipo: 'RECEITA' },
    { data: '2024-11-15', descricao: 'Bônus Funcionários', categoria: 'Pessoal', valor: 2000.00, tipo: 'DESPESA' },
    { data: '2024-11-25', descricao: 'Consultoria Estratégica', categoria: 'Serviços', valor: 3500.00, tipo: 'RECEITA' }
  ];

  // Adicionar dados com formatação
  data.forEach(row => {
    const dataRow = worksheet.addRow([
      row.data,
      row.descricao,
      row.categoria,
      row.valor,
      row.tipo
    ]);

    // Formatar valor como moeda
    dataRow.getCell(4).numFmt = 'R$ #,##0.00';
    
    // Cor baseada no tipo
    if (row.tipo === 'RECEITA') {
      dataRow.getCell(5).font = { color: { argb: 'FF00B050' }, bold: true };
    } else {
      dataRow.getCell(5).font = { color: { argb: 'FFFF0000' }, bold: true };
    }

    // Alinhar valores
    dataRow.getCell(4).alignment = { horizontal: 'right' };
    dataRow.getCell(5).alignment = { horizontal: 'center' };
  });

  // Adicionar bordas
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Adicionar rodapé com resumo
  worksheet.addRow([]);
  const summaryRow = worksheet.addRow(['', '', 'RESUMO:', '', '']);
  summaryRow.font = { bold: true, size: 11 };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE7E6E6' }
  };

  const totalReceitas = data.filter(r => r.tipo === 'RECEITA').reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = data.filter(r => r.tipo === 'DESPESA').reduce((sum, r) => sum + r.valor, 0);
  const lucro = totalReceitas - totalDespesas;

  worksheet.addRow(['', '', 'Total Receitas:', totalReceitas, '']);
  worksheet.addRow(['', '', 'Total Despesas:', totalDespesas, '']);
  worksheet.addRow(['', '', 'Lucro:', lucro, '']);

  // Formatar resumo
  worksheet.getCell('D' + (worksheet.rowCount - 2)).numFmt = 'R$ #,##0.00';
  worksheet.getCell('D' + (worksheet.rowCount - 1)).numFmt = 'R$ #,##0.00';
  worksheet.getCell('D' + worksheet.rowCount).numFmt = 'R$ #,##0.00';
  
  worksheet.getCell('D' + (worksheet.rowCount - 2)).font = { color: { argb: 'FF00B050' }, bold: true };
  worksheet.getCell('D' + (worksheet.rowCount - 1)).font = { color: { argb: 'FFFF0000' }, bold: true };
  worksheet.getCell('D' + worksheet.rowCount).font = { color: { argb: lucro >= 0 ? 'FF00B050' : 'FFFF0000' }, bold: true };

  // Salvar arquivo
  const filePath = path.join(__dirname, '..', 'exemplo-financeiro-teste.xlsx');
  await workbook.xlsx.writeFile(filePath);
  
  console.log('✓ Arquivo criado com sucesso!');
  console.log(`  Localização: ${filePath}`);
  console.log('');
  console.log('Dados incluídos:');
  console.log(`  - ${data.length} transações`);
  console.log(`  - Período: Janeiro a Abril 2024`);
  console.log(`  - Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
  console.log(`  - Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
  console.log(`  - Lucro: R$ ${lucro.toFixed(2)}`);
  console.log('');
  console.log('Use este arquivo para testar o upload no sistema!');
}

// Executar
createSampleExcel().catch(console.error);
