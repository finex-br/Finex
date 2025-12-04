# 🎯 Quick Start - Rode o Backend em 3 passos

## 1️⃣ Instalar dependências

```bash
cd backend
npm install
```

## 2️⃣ Configurar banco de dados

### Opção A: PostgreSQL Local

```bash
# Criar banco
createdb finex

# Ou via SQL
psql -U postgres
CREATE DATABASE finex;
```

Edite o `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finex
```

### Opção B: Docker PostgreSQL

```bash
docker run --name finex-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=finex -p 5432:5432 -d postgres:14
```

## 3️⃣ Rodar aplicação

```bash
npm run start:dev
```

Acesse: **http://localhost:3000**

---

## 🧪 Testar API

### Registrar usuário

```bash
curl -X POST http://localhost:3000/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "role": "ENTREPRENEUR"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

## ✅ Validações da senha

- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 maiúscula
- ✅ Pelo menos 1 minúscula
- ✅ Pelo menos 1 número
- ✅ Pelo menos 1 caractere especial (!@#$%^&*)

---

## 📊 Arquitetura

- **DDD + Clean Architecture + TDD**
- **70 testes passando** (Value Objects + Entities + Use Cases + Infrastructure)
- **TypeORM** para PostgreSQL
- **JWT** para autenticação
- **bcrypt** para hash de senhas

---

## 📚 Documentação completa

Veja `README.md` para guia detalhado.
