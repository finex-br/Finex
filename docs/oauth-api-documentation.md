# OAuth API Documentation

## Overview

API REST para autenticação via OAuth 2.0 com suporte a múltiplos provedores sociais.

**Providers Suportados:**
- Google OAuth 2.0
- GitHub OAuth 2.0
- Apple Sign In
- Facebook OAuth 2.0

**Base URL:** `http://localhost:3000` (desenvolvimento)

---

## Endpoints

### 1. OAuth Callback

Endpoint para receber o código de autorização do provider OAuth e autenticar/registrar o usuário.

**Endpoint:** `POST /auth/oauth/:provider/callback`

**Providers válidos:** `google`, `github`, `apple`, `facebook`

#### Request

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `provider` (string, required) - Nome do provider OAuth (google, github, apple, facebook)

**Body:**
```json
{
  "code": "4/0AY0e-g7QzQZxW8...",
  "redirectUri": "https://example.com/callback",
  "state": "random-state-string"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| code | string | Sim | Código de autorização retornado pelo provider OAuth |
| redirectUri | string | Não | URI de redirecionamento usada no fluxo OAuth |
| state | string | Não | Parâmetro state para proteção CSRF |

#### Response

**Success (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@gmail.com",
  "isNewUser": false
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| accessToken | string | Token JWT para autenticação nas próximas requisições |
| userId | string | ID único do usuário |
| email | string | Email do usuário |
| isNewUser | boolean | Indica se é um novo usuário registrado |

**Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Provider google is not supported",
  "error": "Bad Request"
}
```

**Error (400 Bad Request - OAuth Failed):**
```json
{
  "statusCode": 400,
  "message": "Invalid provider: INVALID_PROVIDER",
  "error": "Bad Request"
}
```

#### Examples

**cURL - Google:**
```bash
curl -X POST http://localhost:3000/auth/oauth/google/callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AY0e-g7QzQZxW8...",
    "redirectUri": "http://localhost:3000/auth/google/callback"
  }'
```

**cURL - GitHub:**
```bash
curl -X POST http://localhost:3000/auth/oauth/github/callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "abc123def456",
    "redirectUri": "http://localhost:3000/auth/github/callback"
  }'
```

**JavaScript (Fetch API):**
```javascript
const response = await fetch('http://localhost:3000/auth/oauth/google/callback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: '4/0AY0e-g7QzQZxW8...',
    redirectUri: 'http://localhost:3000/auth/google/callback'
  })
});

const data = await response.json();
console.log('Access Token:', data.accessToken);
```

---

### 2. Link Social Account

Vincula uma conta social OAuth a um usuário já autenticado.

**Endpoint:** `POST /auth/social-account/link`

**Authentication:** Required (JWT Bearer Token)

#### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "provider": "GOOGLE",
  "code": "4/0AY0e-g7QzQZxW8...",
  "redirectUri": "https://example.com/callback"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| provider | string | Sim | Nome do provider (GOOGLE, GITHUB, APPLE, FACEBOOK) |
| code | string | Sim | Código de autorização do provider OAuth |
| redirectUri | string | Não | URI de redirecionamento usada no fluxo OAuth |

#### Response

**Success (204 No Content):**
```
(No body)
```

**Error (400 Bad Request - Provider não suportado):**
```json
{
  "statusCode": 400,
  "message": "Provider INVALID is not supported",
  "error": "Bad Request"
}
```

**Error (400 Bad Request - Conta já vinculada):**
```json
{
  "statusCode": 400,
  "message": "Social account already linked to this user",
  "error": "Bad Request"
}
```

**Error (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Examples

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/social-account/link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "provider": "GOOGLE",
    "code": "4/0AY0e-g7QzQZxW8...",
    "redirectUri": "http://localhost:3000/auth/google/callback"
  }'
```

**JavaScript (Fetch API):**
```javascript
const response = await fetch('http://localhost:3000/auth/social-account/link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    provider: 'GITHUB',
    code: 'abc123def456',
    redirectUri: 'http://localhost:3000/auth/github/callback'
  })
});

if (response.status === 204) {
  console.log('Account linked successfully!');
}
```

---

### 3. Unlink Social Account

Remove o vínculo de uma conta social OAuth de um usuário autenticado.

**Endpoint:** `DELETE /auth/social-account/unlink`

**Authentication:** Required (JWT Bearer Token)

#### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "provider": "GOOGLE"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| provider | string | Sim | Nome do provider a desvincular (GOOGLE, GITHUB, APPLE, FACEBOOK) |

#### Response

**Success (204 No Content):**
```
(No body)
```

**Error (400 Bad Request - Provider não suportado):**
```json
{
  "statusCode": 400,
  "message": "Provider INVALID is not supported",
  "error": "Bad Request"
}
```

**Error (400 Bad Request - Conta não vinculada):**
```json
{
  "statusCode": 400,
  "message": "Social account not found",
  "error": "Bad Request"
}
```

**Error (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Examples

**cURL:**
```bash
curl -X DELETE http://localhost:3000/auth/social-account/unlink \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "provider": "GOOGLE"
  }'
```

**JavaScript (Fetch API):**
```javascript
const response = await fetch('http://localhost:3000/auth/social-account/unlink', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    provider: 'GITHUB'
  })
});

if (response.status === 204) {
  console.log('Account unlinked successfully!');
}
```

---

## OAuth Flow

### Fluxo Completo de Autenticação

```
1. Frontend redireciona usuário para o provider OAuth
   ↓
2. Usuário autoriza o aplicativo no provider
   ↓
3. Provider redireciona de volta com authorization code
   ↓
4. Frontend envia código para POST /auth/oauth/:provider/callback
   ↓
5. Backend troca código por access token e obtém perfil do usuário
   ↓
6. Backend cria/encontra usuário e gera JWT
   ↓
7. Frontend recebe accessToken e usa para requisições autenticadas
```

### URLs de Autorização OAuth

#### Google
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  response_type=code&
  scope=openid email profile
```

#### GitHub
```
https://github.com/login/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=read:user user:email
```

#### Apple
```
https://appleid.apple.com/auth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  response_type=code&
  scope=name email&
  response_mode=form_post
```

#### Facebook
```
https://www.facebook.com/v18.0/dialog/oauth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=email,public_profile
```

---

## Error Codes

| Status Code | Descrição |
|-------------|-----------|
| 200 | Sucesso - OAuth callback processado |
| 204 | Sucesso - Operação de link/unlink concluída |
| 400 | Bad Request - Provider inválido, código inválido, ou validação falhou |
| 401 | Unauthorized - Token JWT ausente ou inválido |
| 500 | Internal Server Error - Erro no servidor |

---

## Security

### JWT Authentication

Para endpoints protegidos (`/auth/social-account/*`), inclua o JWT token no header:

```
Authorization: Bearer <jwt_token>
```

### CSRF Protection

Recomenda-se usar o parâmetro `state` no fluxo OAuth para proteção contra CSRF:

1. Gere um token aleatório antes de redirecionar para o provider
2. Armazene no session/localStorage
3. Verifique se o `state` retornado é o mesmo

### HTTPS

Em produção, **sempre use HTTPS** para:
- Proteger tokens em trânsito
- Prevenir man-in-the-middle attacks
- Requisito dos providers OAuth

---

## Rate Limiting

Recomenda-se implementar rate limiting:
- OAuth callback: 10 requisições por minuto por IP
- Link/Unlink: 5 requisições por minuto por usuário

---

## Environment Variables

Configure as seguintes variáveis de ambiente:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Apple Sign In
APPLE_CLIENT_ID=your_client_id
APPLE_TEAM_ID=your_team_id
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY=your_private_key

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
```

---

## Testing

### Postman Collection

Importe a collection do Postman para testar os endpoints:

**POST OAuth Callback:**
```json
{
  "method": "POST",
  "url": "{{baseUrl}}/auth/oauth/google/callback",
  "body": {
    "code": "4/0AY0e-g7QzQZxW8...",
    "redirectUri": "http://localhost:3000/auth/google/callback"
  }
}
```

### Unit Tests

Execute os testes:
```bash
npm test
```

200 testes implementados cobrindo toda a funcionalidade OAuth.

---

## Changelog

### v1.0.0 (2025-12-08)
- ✅ Implementação inicial OAuth 2.0
- ✅ Suporte para Google, GitHub, Apple, Facebook
- ✅ Endpoints de link/unlink de contas sociais
- ✅ 200 testes unitários
- ✅ Documentação completa da API
