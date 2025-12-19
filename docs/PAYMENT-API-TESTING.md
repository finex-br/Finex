# Guia de Teste - API de Pagamento (Asaas)

## 📋 Pré-requisitos

1. **Conta Asaas** criada em [https://www.asaas.com](https://www.asaas.com)
2. **API Key** obtida no painel Asaas (modo sandbox ou produção)
3. **Banco de dados PostgreSQL** rodando
4. **Node.js v18+** e npm instalados

---

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta `backend/` com:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finex

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui
JWT_EXPIRES_IN=7d

# Asaas Payment Gateway
ASAAS_API_KEY=$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODc5Mzk6OiRhYWNoXzFhZTlkYzEzLTUzOWUtNGRjNy1iNjAwLWZhNzI0YzYwNGY2MA==
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_SECRET=seu-webhook-secret-aqui
```

> ⚠️ **IMPORTANTE**: Use `sandbox` para testes, `production` apenas quando pronto

### 2. Criar Tabela no Banco de Dados

Execute no PostgreSQL:

```sql
CREATE TABLE checkouts (
  id UUID PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL,
  "asaasCheckoutId" VARCHAR(255),
  "asaasPaymentId" VARCHAR(255),
  "checkoutUrl" TEXT,
  "maxInstallments" INT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "paidAt" TIMESTAMP,
  "expiresAt" TIMESTAMP
);

CREATE INDEX idx_checkouts_user ON checkouts("userId");
CREATE INDEX idx_checkouts_asaas ON checkouts("asaasCheckoutId");
```

### 3. Instalar Dependências e Iniciar Servidor

```bash
cd backend
npm install
npm run start:dev
```

✅ Servidor rodando em `http://localhost:3000`

---

## 🧪 Testando a API

### Passo 1: Autenticar e Obter Token JWT

Primeiro, você precisa fazer login para obter um token JWT:

**Endpoint:** `POST /auth/signin`

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@example.com",
    "password": "sua-senha"
  }'
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "seu-email@example.com",
    "name": "Seu Nome"
  }
}
```

> 💡 Copie o `accessToken` - você vai usá-lo nas próximas requisições

---

### Passo 2: Criar um Checkout (Pagamento)

**Endpoint:** `POST /payment/checkout`

#### Com cURL:

```bash
curl -X POST http://localhost:3000/payment/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "amount": 99.90,
    "description": "Plano Premium - Assinatura Mensal",
    "maxInstallments": 12
  }'
```

#### Com Postman/Insomnia:

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body (JSON):**
```json
{
  "amount": 99.90,
  "description": "Plano Premium - Assinatura Mensal",
  "maxInstallments": 12
}
```

**Resposta Esperada (201 Created):**
```json
{
  "checkoutId": "550e8400-e29b-41d4-a716-446655440000",
  "checkoutUrl": "https://sandbox.asaas.com/checkout/abc123def456",
  "amount": 99.90,
  "description": "Plano Premium - Assinatura Mensal",
  "status": "PENDING",
  "expiresAt": "2025-12-18T10:30:00.000Z"
}
```

---

### Passo 3: Consultar Checkout

**Endpoint:** `GET /payment/checkout/:id`

```bash
curl -X GET http://localhost:3000/payment/checkout/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta:**
```json
{
  "checkoutId": "550e8400-e29b-41d4-a716-446655440000",
  "checkoutUrl": "https://sandbox.asaas.com/checkout/abc123def456",
  "amount": 99.90,
  "description": "Plano Premium - Assinatura Mensal",
  "status": "PENDING"
}
```

---

## 🔔 Configurar Webhook Asaas

### 1. Expor Servidor Local (Túnel Público)

#### ✅ Opção Recomendada: localtunnel (SEM cadastro)

1. **Instalar**:
   ```bash
   npm install -g localtunnel
   ```

2. **Rodar**:
   ```bash
   lt --port 3000
   ```

3. **Resultado**:
   ```
   your url is: https://lazy-dogs-jump.loca.lt
   ```

✅ **Copie a URL gerada** - é ela que você vai usar no Asaas!

> 💡 **Vantagens**: Instalação em 1 comando, sem cadastro, sem configuração

---

#### Opção Alternativa: ngrok (requer cadastro)

Se o localtunnel não funcionar, use ngrok:

1. **Baixar**: [ngrok.com/download](https://ngrok.com/download)
2. **Criar conta**: [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
3. **Autenticar**:
   ```bash
   ngrok config add-authtoken SEU_TOKEN
   ```
4. **Rodar**:
   ```bash
   ngrok http 3000
   ```

---

#### Outras Alternativas:

**Cloudflare Tunnel**:
```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:3000
```

### 2. Configurar no Painel Asaas

1. Acesse [https://sandbox.asaas.com](https://sandbox.asaas.com)
2. Vá em **Configurações** → **Integrações** → **Webhooks**
3. Clique em **Adicionar Webhook**
4. Configure:
   - **URL**: `https://lazy-dogs-jump.loca.lt/webhooks/asaas/payment`
     *(substitua pela URL que o localtunnel gerou)*
   - **Eventos**: Marque todos relacionados a pagamento
     - ✅ PAYMENT_RECEIVED
     - ✅ PAYMENT_CONFIRMED
     - ✅ PAYMENT_OVERDUE
     - ✅ PAYMENT_REFUNDED
     - ✅ PAYMENT_DELETED
5. Salve

> ⚠️ **IMPORTANTE**: Mantenha o localtunnel/ngrok rodando enquanto testar. Se fechar, a URL muda e você precisa atualizar no Asaas.

### 3. Testar Webhook

Após configurar, quando um pagamento for confirmado no Asaas, o sistema receberá automaticamente:

```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_abc123",
    "status": "CONFIRMED",
    "value": 99.90
  }
}
```

O sistema irá:
1. Localizar o checkout pelo `asaasCheckoutId`
2. Atualizar status para `CONFIRMED` ou `RECEIVED`
3. Registrar `paidAt` com data/hora do pagamento

---

## 📊 Fluxo de Estados do Checkout

```
PENDING → CONFIRMED → RECEIVED
   ↓           ↓
CANCELLED   OVERDUE
```

- **PENDING**: Checkout criado, aguardando pagamento
- **CONFIRMED**: Pagamento detectado, processando
- **RECEIVED**: Pagamento confirmado e recebido
- **OVERDUE**: Pagamento venceu
- **CANCELLED**: Checkout cancelado
- **REFUNDED**: Pagamento estornado

---

## 🐛 Testes Automatizados

Execute os testes do módulo:

```bash
npm test -- payment
```

**Resultado esperado:**
```
Test Suites: 5 passed, 5 total
Tests:       50 passed, 50 total
```

---

## 🔍 Troubleshooting

### ❌ Erro: "Access token not found"

**Solução:** Verifique se o header `Authorization: Bearer TOKEN` está presente

### ❌ Erro: "Invalid or expired token"

**Solução:** Faça login novamente para obter um token novo

### ❌ Erro: "ASAAS_API_KEY is undefined"

**Solução:** Verifique se o `.env` está configurado corretamente e reinicie o servidor

### ❌ Webhook não está funcionando

**Soluções:**
1. Verifique se o localtunnel/ngrok está rodando
2. Confirme a URL no painel Asaas (tem que ser a URL gerada pelo túnel)
3. Cheque os logs do servidor: `npm run start:dev`
4. Teste manualmente: `curl https://sua-url.loca.lt/webhooks/asaas/payment`

---

## 📝 Exemplo Completo (Node.js)

```javascript
const axios = require('axios');

// 1. Fazer login
const loginResponse = await axios.post('http://localhost:3000/auth/signin', {
  email: 'user@example.com',
  password: 'senha123'
});

const token = loginResponse.data.accessToken;

// 2. Criar checkout
const checkoutResponse = await axios.post(
  'http://localhost:3000/payment/checkout',
  {
    amount: 199.90,
    description: 'Plano Anual Premium',
    maxInstallments: 12
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

console.log('Checkout URL:', checkoutResponse.data.checkoutUrl);
console.log('Status:', checkoutResponse.data.status);
```

---

## 📚 Documentação Swagger

Acesse a documentação interativa da API:

```
http://localhost:3000/api
```

Lá você pode:
- Ver todos os endpoints disponíveis
- Testar requisições diretamente pelo navegador
- Visualizar schemas de request/response

---

## ✅ Checklist de Teste

- [ ] Servidor iniciado com sucesso
- [ ] Banco de dados criado e migrado
- [ ] Token JWT obtido via login
- [ ] Checkout criado com sucesso (status PENDING)
- [ ] URL do Asaas gerada corretamente
- [ ] Webhook configurado no painel Asaas
- [ ] Pagamento simulado no sandbox Asaas
- [ ] Status atualizado automaticamente via webhook
- [ ] Testes automatizados passando (50/50)

---

## 🎯 Próximos Passos

1. **Testar pagamento real** no sandbox Asaas
2. **Implementar notificações** ao usuário quando pagamento for confirmado
3. **Adicionar refund endpoint** para estornos
4. **Criar dashboard** para visualizar transações
5. **Migrar para produção** alterando `ASAAS_ENVIRONMENT=production`

---

**Qualquer dúvida, consulte:**
- [Documentação Asaas](https://docs.asaas.com)
- [NestJS Docs](https://docs.nestjs.com)
- Logs do servidor: `npm run start:dev`
