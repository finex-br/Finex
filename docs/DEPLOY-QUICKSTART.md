# ⚡ Deploy Rápido - Finex

## 🚀 Deploy em 5 Minutos

### 1. Preparar Código
```bash
git add .
git commit -m "chore: deploy"
git push
```

### 2. Configurar no Coolify

**Resource Type:** Docker Compose  
**Repository:** `https://github.com/Will-Reiner/Finex.git`  
**Branch:** `main`  
**Compose File:** `docker-compose.production.yml`

### 3. Variáveis de Ambiente (copie tudo)

```env
POSTGRES_USER=finex
POSTGRES_PASSWORD=SuaSenhaForteAqui!2024
POSTGRES_DB=finex
NODE_ENV=production
DATABASE_URL=postgresql://finex:SuaSenhaForteAqui!2024@postgres:5432/finex
REDIS_URL=redis://redis:6379
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=https://finexbr.astraflow.io
API_URL=https://api.finexbr.astraflow.io
GOOGLE_CALLBACK_URL=https://api.finexbr.astraflow.io/auth/oauth/google/callback
VITE_API_URL=https://api.finexbr.astraflow.io
VITE_GOOGLE_CLIENT_ID=
```

### 4. Configurar Domínios

**Backend:** `api.finexbr.astraflow.io`  
**Frontend:** `finexbr.astraflow.io`

**No Cloudflare:**
- Registro A: `finexbr.astraflow.io` → `89.116.73.169` (nuvem CINZA)
- Registro A: `api.finexbr.astraflow.io` → `89.116.73.169` (nuvem CINZA)

### 5. Deploy

Clique em **"Deploy"** no Coolify e aguarde 5-10 minutos.

### 6. Testar

```bash
# Backend
curl https://api.finexbr.astraflow.io/health

# Frontend
curl -I https://finexbr.astraflow.io
```

---

## 🆘 Problemas Comuns

### Erro de Autenticação PostgreSQL
```bash
ssh root@89.116.73.169
docker stop <postgres-container>
docker rm <postgres-container>
docker volume rm <postgres-volume>
# Faça deploy novamente
```

### Frontend não conecta no Backend
**Causa:** Build com URL errada.  
**Solução:** Force rebuild no Coolify com `VITE_API_URL` correto.

### SSL não funciona
**Causa:** Cloudflare Proxy ativo.  
**Solução:** Deixar registros DNS com nuvem CINZA (DNS Only).

---

## 📝 Checklist

- [ ] Código commitado e no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Domínios adicionados nos serviços
- [ ] DNS configurado no Cloudflare (nuvem cinza)
- [ ] Deploy executado
- [ ] Backend retorna `{"status":"ok"}`
- [ ] Frontend carrega
- [ ] HTTPS funcionando

---

## 🎯 Ordem Correta

1. Code → GitHub
2. Coolify → Config
3. Cloudflare → DNS
4. Coolify → Deploy
5. Wait → Test
6. ✅ Done!

---

**Para guia completo, veja:** `docs/DEPLOY-GUIDE.md`
