import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Configure com suas credenciais do banco
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'postgres',
  database: 'finex',
});

async function fixDatabaseSchema() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Conectado ao banco de dados\n');

    // Verificar se a coluna password_hash existe
    console.log('📊 Verificando estrutura da tabela users...\n');
    
    const columns = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('Colunas atuais:');
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    const hasPasswordHash = columns.some((col: any) => col.column_name === 'password_hash');

    if (!hasPasswordHash) {
      console.log('\n❌ Coluna password_hash não encontrada!');
      console.log('🔧 Aplicando correção...\n');

      // Ler o script SQL completo
      const sqlPath = path.join(__dirname, 'init-database.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');

      // Dropar e recriar as tabelas
      console.log('1. Removendo tabelas existentes...');
      await AppDataSource.query(`
        DROP TABLE IF EXISTS survey_responses CASCADE;
        DROP TABLE IF EXISTS survey_questions CASCADE;
        DROP TABLE IF EXISTS survey_assessments CASCADE;
        DROP TABLE IF EXISTS financial_data CASCADE;
        DROP TABLE IF EXISTS company_members CASCADE;
        DROP TABLE IF EXISTS subscriptions CASCADE;
        DROP TABLE IF EXISTS companies CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
      console.log('   ✓ Tabelas removidas');

      // Executar o script SQL completo
      console.log('2. Criando estrutura completa do banco...');
      await AppDataSource.query(sqlContent);
      console.log('   ✓ Estrutura criada\n');

      console.log('✅ Schema do banco corrigido com sucesso!');
      console.log('\n⚠️  ATENÇÃO: Todos os dados foram removidos.');
      console.log('   Você precisará criar novos usuários.\n');
    } else {
      console.log('\n✅ Coluna password_hash existe! Schema está correto.\n');
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixDatabaseSchema();
