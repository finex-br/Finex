# 🚀 Guia Completo: Rodar Finex Localmente

Este guia te ajudará a configurar e rodar o projeto Finex localmente do zero.

---

## 📋 Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** (já instalado)

---

## 🗄️ PASSO 1: Configurar Banco de Dados PostgreSQL

### 1.1. Iniciar PostgreSQL com Docker

```powershell
# Navegue até a pasta backend
cd backend

# Inicie o PostgreSQL
docker-compose up -d

# Verifique se está rodando
docker ps
```

**Resultado esperado:**
```
CONTAINER ID   IMAGE                 STATUS         PORTS
xxx            postgres:14-alpine    Up 10 seconds  0.0.0.0:5433->5432/tcp
```

### 1.2. Verificar conexão

```powershell
# Teste a conexão com o banco
docker exec -it finex-postgres psql -U postgres -d finex -c "SELECT version();"
```

---

## ⚙️ PASSO 2: Configurar Backend

### 2.1. Criar arquivo .env

```powershell
# Ainda na pasta backend
# Copie o exemplo
Copy-Item .env.example .env

# Ou crie manualmente com este conteúdo:
@"
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/finex

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis (opcional para dev)
REDIS_URL=redis://localhost:6379
"@ | Out-File -FilePath .env -Encoding utf8
```

### 2.2. Instalar dependências

```powershell
npm install
```

### 2.3. Criar migrations (gerar schema do banco)

**IMPORTANTE:** O TypeORM precisa que você crie as entities primeiro. Já temos a entity `FinancialTransaction` no módulo financial.

Por enquanto, vamos rodar em modo `synchronize: true` para desenvolvimento (TypeORM cria as tabelas automaticamente).

Verifique o arquivo `backend/src/shared/infra/env/env.config.ts` - ele deve ter:

```typescript
typeOrmConfig: {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === 'development', // ← Auto-cria tabelas em dev
  logging: process.env.NODE_ENV === 'development',
  // ...
}
```

### 2.4. Rodar backend

```powershell
# Modo desenvolvimento (hot reload)
npm run start:dev
```

**Resultado esperado:**
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Listening on port 3000
```

Teste no navegador: http://localhost:3000

---

## 🎨 PASSO 3: Configurar Frontend

### 3.1. Abrir novo terminal

```powershell
# Navegue até a pasta frontend (do root do projeto)
cd ..\frontend
```

### 3.2. Criar arquivo .env

```powershell
@"
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=optional-for-now
"@ | Out-File -FilePath .env -Encoding utf8
```

### 3.3. Instalar dependências

```powershell
npm install
```

### 3.4. Rodar frontend

```powershell
npm run dev
```

**Resultado esperado:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Abra no navegador: http://localhost:5173

---

## 🧪 PASSO 4: Testar Fluxo Completo

### 4.1. Criar conta
1. Acesse http://localhost:5173
2. Clique em "Cadastrar"
3. Preencha: email, nome, senha
4. Clique em "Criar conta"

### 4.2. Fazer login
1. Use o email e senha criados
2. Você será redirecionado para `/dashboard`

### 4.3. Upload de Excel
1. No dashboard, clique em "Importar Planilha"
2. Crie um Excel simples com estas colunas:

| Data       | Descrição  | Categoria | Valor | Tipo    |
|------------|------------|-----------|-------|---------|
| 2024-01-15 | Venda A    | Vendas    | 1000  | RECEITA |
| 2024-01-20 | Compra B   | Compras   | 500   | DESPESA |
| 2024-02-10 | Venda C    | Vendas    | 1500  | RECEITA |

3. Salve como `financeiro.xlsx`
4. Faça upload no sistema
5. Aguarde processamento

### 4.4. Visualizar Dashboard
1. Volte para `/dashboard`
2. Você verá:
   - ✅ KPIs (Receitas, Despesas, Lucro)
   - ✅ Filtro de período (MENSAL selecionado)
   - ✅ 3 gráficos (Tendência, Categorias, Mensal)

### 4.5. Testar filtros
1. Mude o período de "Mensal" para "Anual"
2. Gráficos devem atualizar automaticamente
3. Teste "Personalizado" e selecione datas customizadas

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to PostgreSQL"

```powershell
# Verifique se o container está rodando
docker ps

# Se não estiver, inicie novamente
cd backend
docker-compose up -d

# Verifique os logs
docker logs finex-postgres
```

### Erro: "Port 5433 already in use"

```powershell
# Outra aplicação está usando a porta. Mude em docker-compose.yml:
# ports:
#   - '5434:5432'  # ← Mudou de 5433 para 5434

# E no .env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5434/finex
```

### Erro: "Module not found"

```powershell
# Instale dependências novamente
cd backend
npm install

cd ..\frontend
npm install
```

### Backend não inicia

```powershell
# Verifique erros de sintaxe
cd backend
npm run type-check

# Verifique lint
npm run lint:check
```

### Frontend com erro de CORS

No backend, verifique `main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:5173', // ← Deve estar permitido
  credentials: true,
});
```

---

## 📊 Estrutura de Pastas

```
Finex/
├── backend/
│   ├── src/
│   │   ├── main.ts                    # Entry point
│   │   ├── app.module.ts              # Root module
│   │   └── modules/
│   │       ├── financial/             # Módulo financeiro (PRONTO)
│   │       └── authentication/        # Módulo auth (FUTURO)
│   ├── docker-compose.yml             # PostgreSQL local
│   ├── .env                           # Variáveis de ambiente
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.tsx                   # Entry point
    │   ├── components/
    │   │   ├── DateFilter.tsx         # ✅ NOVO
    │   │   └── FinancialCharts.tsx    # ✅ NOVO
    │   ├── hooks/
    │   │   └── useFinancialData.ts    # ✅ ATUALIZADO
    │   ├── services/
    │   │   └── financialService.ts    # ✅ ATUALIZADO
    │   └── views/
    │       └── DashboardView.tsx      # ✅ ATUALIZADO
    ├── .env                           # Variáveis de ambiente
    └── package.json
```

---

## 🎯 Checklist Rápido

- [ ] Docker Desktop rodando
- [ ] PostgreSQL iniciado (`docker-compose up -d`)
- [ ] Backend `.env` criado
- [ ] Backend rodando (`npm run start:dev` na porta 3000)
- [ ] Frontend `.env` criado
- [ ] Frontend rodando (`npm run dev` na porta 5173)
- [ ] Conta criada no sistema
- [ ] Excel de teste criado e importado
- [ ] Dashboard exibindo KPIs e gráficos
- [ ] Filtro de período funcionando

---

## 🚀 Próximos Passos (Depois que rodar)

1. **Criar entities do módulo Authentication**
   - User, Company, CompanyMember entities
   - JWT Guards e Decorators

2. **Migrations TypeORM**
   - Gerar migrations a partir das entities
   - Versionamento do schema

3. **DuckDB para Analytics** (opcional)
   - Integrar DuckDB para queries analíticas
   - Migrar dados de PostgreSQL para DuckDB

4. **Deploy**
   - Configurar CI/CD
   - Deploy em servidor (Railway, Render, VPS)

---

## 📞 Comandos Úteis

```powershell
# Backend
npm run start:dev          # Rodar em desenvolvimento
npm run build              # Compilar para produção
npm test                   # Rodar todos os testes
npm run type-check         # Verificar tipos TypeScript
npm run lint:check         # Verificar linting

# Frontend
npm run dev                # Rodar em desenvolvimento
npm run build              # Compilar para produção
npm run preview            # Preview da build de produção

# Docker
docker-compose up -d       # Iniciar serviços
docker-compose down        # Parar serviços
docker-compose logs -f     # Ver logs em tempo real
docker ps                  # Listar containers rodando
docker exec -it finex-postgres psql -U postgres -d finex  # Acessar PostgreSQL
```

---

**Agora você está pronto para rodar o Finex localmente! 🎉**

Se encontrar problemas, verifique a seção de Troubleshooting ou me avise.
