import { DataSource } from 'typeorm';

// Configure com suas credenciais do banco
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'finex_user',
  password: 'finex_password',
  database: 'finex_db',
});

async function checkUsers() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Conectado ao banco de dados\n');

    const users = await AppDataSource.query(`
      SELECT id, email, name, role, "createdAt" 
      FROM users 
      ORDER BY "createdAt" DESC
    `);

    console.log(`📊 Total de usuários: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
    } else {
      console.log('👥 Usuários cadastrados:');
      console.log('─'.repeat(80));
      users.forEach((user: any, index: number) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Nome: ${user.name || 'N/A'}`);
        console.log(`   Role: ${user.role || 'N/A'}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Criado em: ${new Date(user.createdAt).toLocaleString('pt-BR')}`);
        console.log('─'.repeat(80));
      });
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Erro ao consultar usuários:', error);
    process.exit(1);
  }
}

checkUsers();
