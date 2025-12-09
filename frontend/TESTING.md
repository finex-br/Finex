# 🧪 FinEx Auth Test Interface - Guia de Uso

## 🚀 Como Usar

### 1. Iniciar o Backend
```bash
cd backend
npm run start:dev
```
✅ Backend rodando em: **http://localhost:3000**

### 2. Abrir o Frontend

**Opção mais simples:**
- Abra o arquivo `index.html` direto no navegador
- Ou clique com botão direito → "Open with Live Server" (se tiver a extensão)

**Ou use um servidor local:**
```bash
# Python
python -m http.server 8080

# Node.js
npx http-server -p 8080
```

Depois acesse: **http://localhost:8080**

---

## ✅ O Que Você Pode Testar

### 1️⃣ Criar Conta (Sign Up)
1. Preencha o formulário "Create Account":
   - **Nome:** João Silva
   - **Email:** joao@teste.com
   - **Telefone:** +5511999999999
   - **Senha:** Senha123456
2. Clique em "Create Account"
3. ✅ Você verá:
   - Mensagem de sucesso verde
   - Suas informações aparecem no topo
   - O token JWT gerado
   - A resposta completa da API embaixo

### 2️⃣ Fazer Login (Sign In)
1. Use o email e senha que você criou
2. Clique em "Sign In"
3. ✅ Mesmo resultado: token + informações do usuário

### 3️⃣ OAuth Buttons
Os 4 botões de OAuth estão lá:
- 🔵 Google
- ⚫ GitHub
- 🍎 Apple
- 📘 Facebook

**Por enquanto:** Eles mostram um alerta informando que precisam de configuração.

**Para testar de verdade:** Você precisaria configurar as credenciais OAuth (veja seção abaixo).

### 4️⃣ Logout
Clique em "Logout" para limpar a sessão.

---

## 🎯 Features Visuais

### ✨ Quando você está logado:
- ✅ Aparece um card verde com "Logged In"
- Mostra seus dados (ID, email, nome, telefone)
- Mostra o início do token JWT
- Formulários ficam escondidos

### 📡 API Response Display
- Caixa preta no final da página
- Mostra TODA resposta da API em tempo real
- JSON formatado e colorido

### 🎨 Design
- Gradiente roxo bonito de fundo
- Botões com ícones dos providers
- Animações suaves ao passar o mouse
- Responsivo (funciona no celular)

---

## 🔧 Configuração OAuth (Avançado - Opcional)

Se quiser testar OAuth **de verdade**, você precisa:

### Google OAuth
1. Ir em: https://console.cloud.google.com/
2. Criar projeto
3. Habilitar Google+ API
4. Criar OAuth Client ID
5. Adicionar redirect URI: `http://localhost:8080/oauth-callback.html`
6. Copiar o Client ID
7. Editar `script.js` linha 7:
   ```javascript
   clientId: 'SEU_CLIENT_ID_AQUI'
   ```

### GitHub OAuth
1. Ir em: https://github.com/settings/developers
2. New OAuth App
3. Callback URL: `http://localhost:8080/oauth-callback.html`
4. Copiar Client ID
5. Editar `script.js` linha 13:
   ```javascript
   clientId: 'SEU_GITHUB_CLIENT_ID_AQUI'
   ```

### Backend .env
Também precisa adicionar no backend:
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## 🐛 Problemas Comuns

### ❌ "Failed to fetch"
**Causa:** Backend não está rodando  
**Solução:** Execute `npm run start:dev` na pasta backend

### ❌ "CORS policy"
**Causa:** Backend não permite requests do frontend  
**Solução:** Backend já tem CORS habilitado, mas se der erro, verifique o `main.ts`

### ❌ "Invalid credentials"
**Causa:** Email ou senha incorretos  
**Solução:** Crie uma nova conta primeiro

### ❌ Botões OAuth não funcionam
**Causa:** Credenciais OAuth não configuradas (isso é normal!)  
**Solução:** Por enquanto, use Sign Up/Sign In tradicional

---

## 📁 Arquivos

```
frontend/
├── index.html              # Página principal
├── oauth-callback.html     # Handler do OAuth (popup)
├── styles.css             # Estilos
├── script.js              # Lógica JavaScript
└── TESTING.md             # Este arquivo
```

---

## 🎉 Pronto!

1. ✅ Backend rodando
2. ✅ Frontend aberto
3. ✅ Criar conta
4. ✅ Fazer login
5. ✅ Ver token JWT
6. ✅ Ver resposta da API

**Divirta-se testando! 🚀**

---

## 📚 Docs Adicionais

- **Swagger UI:** http://localhost:3000/api/docs
- **API Endpoints:** Veja o arquivo `oauth-api-documentation.md` na pasta `docs`
