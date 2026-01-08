# 🚀 Guia Completo de Deploy - Finex

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Deploy via Coolify (Recomendado)](#deploy-via-coolify)
4. [Deploy Manual com Docker](#deploy-manual-com-docker)
5. [Configuração de Domínios](#configuração-de-domínios)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

### No Servidor VPS
- ✅ Ubuntu 24.04 LTS
- ✅ Docker instalado
- ✅ Coolify instalado e funcionando
- ✅ Traefik configurado (vem com Coolify)
- ✅ Acesso SSH configurado

### Domínios
- ✅ `finexbr.astraflow.io` → Frontend
- ✅ `api.finexbr.astraflow.io` → Backend API

### Variáveis de Ambiente Necessárias
```bash
# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://finex:SUA_SENHA_FORTE@finex-postgres:5432/finex
REDIS_URL=redis://finex-redis:6379
JWT_SECRET=seu_jwt_secret_aqui
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
FRONTEND_URL=https://finexbr.astraflow.io
API_URL=https://api.finexbr.astraflow.io
GOOGLE_CALLBACK_URL=https://api.finexbr.astraflow.io/auth/oauth/google/callback

# Frontend (Build Args)
VITE_API_URL=https://api.finexbr.astraflow.io
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
```

---

## 🔧 Configuração do Ambiente

### 1. Preparar Repositório

**Importante:** Certifique-se de que o código está commitado e no GitHub:

```bash
# No seu computador local
cd Finex
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

### 2. Verificar Arquivos de Deploy

Certifique-se de que estes arquivos existem:

- ✅ `docker-compose.production.yml` - Orquestração dos serviços
- ✅ `backend/Dockerfile` - Build do backend
- ✅ `frontend/Dockerfile` - Build do frontend
- ✅ `frontend/nginx.conf` - Configuração do Nginx

---

## 🎨 Deploy via Coolify (Recomendado)

### Passo 1: Criar Novo Resource no Coolify

1. Acesse o Coolify Dashboard: `http://89.116.73.169:8000`
2. Clique em **"+ New Resource"**
3. Selecione **"Docker Compose"**
4. Configure:
   - **Name**: `finex-production`
   - **Repository**: `https://github.com/Will-Reiner/Finex.git`
   - **Branch**: `main`
   - **Docker Compose Location**: `docker-compose.production.yml`

### Passo 2: Configurar Variáveis de Ambiente

No dashboard do Coolify, adicione as variáveis:

```env
# PostgreSQL
POSTGRES_USER=finex
POSTGRES_PASSWORD=SuaSenhaForteAqui!2024
POSTGRES_DB=finex

# Backend
NODE_ENV=production
DATABASE_URL=postgresql://finex:SuaSenhaForteAqui!2024@postgres:5432/finex
REDIS_URL=redis://redis:6379
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=https://finexbr.astraflow.io
API_URL=https://api.finexbr.astraflow.io
GOOGLE_CALLBACK_URL=https://api.finexbr.astraflow.io/auth/oauth/google/callback

# Frontend Build Args
VITE_API_URL=https://api.finexbr.astraflow.io
VITE_GOOGLE_CLIENT_ID=
```

### Passo 3: Configurar Domínios

**Para o Backend:**
1. Vá em **Settings** do serviço `backend`
2. Em **Domains**, adicione: `api.finexbr.astraflow.io`
3. Ative **HTTPS** (Coolify configura Let's Encrypt automaticamente)

**Para o Frontend:**
1. Vá em **Settings** do serviço `frontend`
2. Em **Domains**, adicione: `finexbr.astraflow.io`
3. Ative **HTTPS**

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (5-10 minutos)
3. Verifique os logs de cada serviço

### Passo 5: Verificação

```bash
# Testar Backend
curl https://api.finexbr.astraflow.io/health

# Deve retornar:
# {"status":"ok","timestamp":"2025-12-12T..."}

# Testar Frontend
curl -I https://finexbr.astraflow.io

# Deve retornar:
# HTTP/2 200
```

---

## 🐳 Deploy Manual com Docker

**Use este método apenas se o Coolify não estiver funcionando.**

### Passo 1: Conectar no Servidor

```bash
ssh root@89.116.73.169
```

### Passo 2: Criar Diretório de Deploy

```bash
mkdir -p /opt/finex
cd /opt/finex
```

### Passo 3: Clonar Repositório

```bash
git clone https://github.com/Will-Reiner/Finex.git .
```

### Passo 4: Criar arquivo .env

```bash
cat > .env << 'EOF'
# PostgreSQL
POSTGRES_USER=finex
POSTGRES_PASSWORD=SuaSenhaForteAqui!2024
POSTGRES_DB=finex

# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://finex:SuaSenhaForteAqui!2024@postgres:5432/finex
REDIS_URL=redis://redis:6379
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=https://finexbr.astraflow.io
API_URL=https://api.finexbr.astraflow.io
GOOGLE_CALLBACK_URL=https://api.finexbr.astraflow.io/auth/oauth/google/callback

# Frontend Build Args
VITE_API_URL=https://api.finexbr.astraflow.io
VITE_GOOGLE_CLIENT_ID=
EOF
```

### Passo 5: Subir os Serviços

```bash
# Usando docker-compose
docker compose -f docker-compose.production.yml up -d

# Ou criar containers manualmente (se docker-compose falhar)
# Veja seção "Deploy Manual Detalhado" abaixo
```

### Passo 6: Verificar Status

```bash
# Ver containers rodando
docker ps

# Ver logs do backend
docker logs finex-backend -f

# Ver logs do frontend
docker logs finex-frontend -f

# Testar conexão do backend com banco
docker exec finex-backend curl http://localhost:3000/health
```

---

## 🔧 Deploy Manual Detalhado (Containers Individuais)

### 1. Criar Rede Docker

```bash
docker network create finex-network
```

### 2. PostgreSQL

```bash
docker run -d \
  --name finex-postgres \
  --network finex-network \
  -e POSTGRES_USER=finex \
  -e POSTGRES_PASSWORD=SuaSenhaForteAqui!2024 \
  -e POSTGRES_DB=finex \
  -e POSTGRES_HOST_AUTH_METHOD=scram-sha-256 \
  -v finex-postgres-data:/var/lib/postgresql/data \
  --restart always \
  postgres:15-alpine

# Testar conexão
docker exec finex-postgres psql -U finex -d finex -c "SELECT 1;"
```

### 3. Redis

```bash
docker run -d \
  --name finex-redis \
  --network finex-network \
  -v finex-redis-data:/data \
  --restart always \
  redis:alpine
```

### 4. Backend

```bash
# Build da imagem
cd /opt/finex/backend
docker build -t finex-backend:latest .

# Rodar container
docker run -d \
  --name finex-backend \
  --network finex-network \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL=postgresql://finex:SuaSenhaForteAqui!2024@finex-postgres:5432/finex \
  -e REDIS_URL=redis://finex-redis:6379 \
  -e JWT_SECRET=seu_jwt_secret_aqui \
  -e GOOGLE_CLIENT_ID= \
  -e GOOGLE_CLIENT_SECRET= \
  -e FRONTEND_URL=https://finexbr.astraflow.io \
  -e API_URL=https://api.finexbr.astraflow.io \
  -e GOOGLE_CALLBACK_URL=https://api.finexbr.astraflow.io/auth/oauth/google/callback \
  --restart always \
  -p 3000:3000 \
  finex-backend:latest

# Verificar logs
docker logs -f finex-backend

# Aguardar mensagem:
# "🚀 Application is running on: http://localhost:3000"
```

### 5. Frontend

```bash
# Build da imagem com Build Args
cd /opt/finex/frontend
docker build -t finex-frontend:latest \
  --build-arg VITE_API_URL=https://api.finexbr.astraflow.io \
  --build-arg VITE_GOOGLE_CLIENT_ID= \
  .

# Rodar container
docker run -d \
  --name finex-frontend \
  --network finex-network \
  --restart always \
  -p 80:80 \
  finex-frontend:latest

# Testar
curl -I http://localhost:80
```

---

## 🌐 Configuração de Domínios

### Opção 1: Usar Traefik (com Coolify)

O Coolify já configura o Traefik automaticamente. Você só precisa:

1. **No Cloudflare:**
   - Adicionar registro A: `finexbr.astraflow.io` → `89.116.73.169`
   - Adicionar registro A: `api.finexbr.astraflow.io` → `89.116.73.169`
   - **Importante:** Desabilitar proxy do Cloudflare (nuvem cinza) para Let's Encrypt funcionar

2. **No Coolify:**
   - Adicionar os domínios nos serviços
   - Ativar HTTPS

### Opção 2: Nginx Reverso (Manual)

Se não estiver usando Coolify, configure um Nginx na frente:

```nginx
# /etc/nginx/sites-available/finex

# Backend API
server {
    listen 80;
    server_name api.finexbr.astraflow.io;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name finexbr.astraflow.io;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar e recarregar:

```bash
ln -s /etc/nginx/sites-available/finex /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Configurar SSL com Certbot
certbot --nginx -d finexbr.astraflow.io -d api.finexbr.astraflow.io
```

---

## 🔍 Troubleshooting

### Problema: "password authentication failed for user finex"

**Causa:** PostgreSQL não está aceitando a senha.

**Solução:**

```bash
# 1. Parar o container
docker stop finex-postgres

# 2. Remover o container E o volume
docker rm finex-postgres
docker volume rm finex-postgres-data

# 3. Recriar com POSTGRES_HOST_AUTH_METHOD
docker run -d \
  --name finex-postgres \
  --network finex-network \
  -e POSTGRES_USER=finex \
  -e POSTGRES_PASSWORD=SuaSenhaForteAqui!2024 \
  -e POSTGRES_DB=finex \
  -e POSTGRES_HOST_AUTH_METHOD=scram-sha-256 \
  -v finex-postgres-data:/var/lib/postgresql/data \
  --restart always \
  postgres:15-alpine

# 4. Testar
docker exec finex-postgres psql -U finex -d finex -c "SELECT 1;"
```

### Problema: Frontend não se conecta ao Backend

**Causa 1:** Frontend foi buildado com URL errada.

**Solução:**
```bash
# Rebuild com a URL correta
docker build -t finex-frontend:latest \
  --build-arg VITE_API_URL=https://api.finexbr.astraflow.io \
  frontend/

# Recriar container
docker stop finex-frontend && docker rm finex-frontend
docker run -d --name finex-frontend --network finex-network -p 80:80 finex-frontend:latest
```

**Causa 2:** CORS bloqueando requisições.

**Solução:** Verificar variável `FRONTEND_URL` no backend.

### Problema: Backend não conecta no PostgreSQL

**Sintomas:**
```
Error: connect ECONNREFUSED
```

**Soluções:**

1. **Verificar se estão na mesma rede:**
```bash
docker network inspect finex-network
# Deve mostrar postgres E backend
```

2. **Verificar DATABASE_URL:**
```bash
docker exec finex-backend env | grep DATABASE_URL
# Deve ser: postgresql://finex:SENHA@finex-postgres:5432/finex
```

3. **Testar conexão:**
```bash
docker exec finex-backend ping finex-postgres
```

### Problema: "npm ci" falhando no build

**Causa:** package-lock.json desatualizado.

**Solução:**
```bash
# Local
cd backend
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: update package-lock.json"
git push

# Rebuild no servidor
```

### Problema: Coolify não aplica mudanças no docker-compose

**Causa:** Coolify cacheia configurações.

**Solução:**
1. No Coolify Dashboard, vá em Settings
2. Clique em **"Force Rebuild"**
3. Ou apague o resource e crie novamente

### Problema: SSL não funciona (ERR_CERT_COMMON_NAME_INVALID)

**Causa:** Cloudflare Proxy está ativo.

**Solução:**
1. Acesse Cloudflare DNS
2. Encontre os registros `finexbr.astraflow.io` e `api.finexbr.astraflow.io`
3. Clique na nuvem laranja para deixar **cinza** (DNS Only)
4. Aguarde 5 minutos
5. No Coolify, clique em **"Retry SSL"**

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Backend responde em `https://api.finexbr.astraflow.io/health`
- [ ] Frontend carrega em `https://finexbr.astraflow.io`
- [ ] Swagger acessível em `https://api.finexbr.astraflow.io/api/docs`
- [ ] Frontend consegue fazer cadastro/login
- [ ] HTTPS funcionando sem erros de certificado
- [ ] Containers com `--restart always` (reiniciam após reboot)
- [ ] Volumes criados para persistência de dados
- [ ] Backup do banco configurado (use `pg_dump`)

---

## 📊 Comandos Úteis

```bash
# Ver todos os containers
docker ps -a

# Ver logs de um container
docker logs -f <container-name>

# Ver uso de recursos
docker stats

# Executar comando em container
docker exec -it <container-name> bash

# Fazer backup do banco
docker exec finex-postgres pg_dump -U finex finex > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i finex-postgres psql -U finex finex < backup_20251212.sql

# Limpar containers parados e imagens não usadas
docker system prune -a

# Ver redes
docker network ls

# Inspecionar rede
docker network inspect finex-network
```

---

## 🎯 Resumo do Deploy Correto

1. **Commit e push do código**
2. **Configurar variáveis de ambiente no Coolify**
3. **Adicionar domínios nos serviços**
4. **Deploy via Coolify**
5. **Configurar DNS no Cloudflare**
6. **Aguardar SSL configurar**
7. **Testar todas as funcionalidades**

**Tempo estimado:** 30-45 minutos

**Dificuldade:** Média

**Pré-requisito principal:** Coolify funcionando corretamente

---

## 📞 Contato de Suporte

Se tiver dúvidas durante o deploy:
- Verifique os logs: `docker logs -f <container-name>`
- Consulte a documentação do Coolify: https://coolify.io/docs
- Revise este guia completamente antes de começar

**Boa sorte com o deploy! 🚀**
