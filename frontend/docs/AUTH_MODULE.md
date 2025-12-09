# 🔐 Módulo de Autenticação - FinEx

## 📁 Estrutura de Arquivos

```
src/
├── services/
│   ├── api.ts              # Cliente HTTP (Axios) com interceptors
│   └── authService.ts      # Serviço de autenticação
├── hooks/
│   ├── useLoginViewModel.ts      # ViewModel do Login (MVVM)
│   └── useLoginViewModel.spec.ts # Testes unitários (10/10 ✅)
└── views/
    ├── LoginView.tsx       # Componente visual de Login
    └── UploadView.tsx      # Página de upload (placeholder)
```

## 🏗️ Arquitetura

### Padrão MVVM (Model-View-ViewModel)

- **Model** (`authService.ts`): Lógica de dados e comunicação com API
- **ViewModel** (`useLoginViewModel.ts`): Lógica de negócio e estado
- **View** (`LoginView.tsx`): Componente presentacional (UI)

### Separação de Responsabilidades

```
LoginView (UI)
    ↓
useLoginViewModel (Lógica de Estado)
    ↓
authService (Comunicação com API)
    ↓
api (Cliente HTTP)
```

## 🚀 Funcionalidades Implementadas

### ✅ Cliente HTTP (`api.ts`)

- ✨ Instância Axios configurada
- 🔧 BaseURL dinâmica via `VITE_API_URL`
- 🔑 Interceptor de requisição (adiciona Bearer token)
- 🚨 Interceptor de resposta (trata erro 401)
- 🔄 Redirecionamento automático para login em token expirado

### ✅ Serviço de Autenticação (`authService.ts`)

- 📝 Interfaces TypeScript estritas
- 🎯 Método `signIn()` tipado
- 🔌 Integração com cliente HTTP
- ⚡ Propagação de erros para ViewModel

### ✅ ViewModel (`useLoginViewModel.ts`)

- 📊 Gerenciamento de estado (email, password, loading, error)
- ✔️ Validação de campos obrigatórios
- 🔐 Salvamento de token no localStorage
- 🧭 Navegação após login bem-sucedido
- 💬 Mensagens de erro amigáveis
- 🧪 **100% testado** (10 testes passando)

### ✅ View (`LoginView.tsx`)

- 🎨 Design responsivo com Tailwind CSS
- 🧩 Componentes shadcn/ui
- ♿ Acessibilidade (labels, ARIA)
- 🎯 UX otimizada (loading states, feedback visual)
- 🧠 Zero lógica de negócio (componente burro)

## 🧪 Testes

### Cobertura: 10/10 testes passando ✅

```bash
# Executar testes
npm test

# Modo UI interativo
npm run test:ui

# Cobertura de código
npm run test:coverage
```

### Cenários Testados

1. ✅ Estado inicial correto
2. ✅ Login com sucesso
3. ✅ Salvamento de token e usuário
4. ✅ Navegação para /upload
5. ✅ Tratamento de erros de API
6. ✅ Mensagens de erro amigáveis
7. ✅ Estados de loading
8. ✅ Atualização de campos
9. ✅ Validação de formulário
10. ✅ Prevent default do submit

## 🎯 Como Usar

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com URL da API
VITE_API_URL=http://localhost:3000
```

### 2. Acessar a Tela de Login

```
http://localhost:5173/login
```

### 3. Testar Fluxo Completo

1. Preencher email e senha
2. Clicar em "Entrar"
3. Aguardar loading
4. Ser redirecionado para `/upload`
5. Token salvo automaticamente no localStorage

## 📡 Endpoints Esperados

O frontend espera que o backend NestJS exponha:

### POST `/auth/signin`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Response (401):**
```json
{
  "message": "Credenciais inválidas"
}
```

## 🔒 Segurança

### Proteções Implementadas

1. **Token no localStorage**: Armazenamento seguro do JWT
2. **Bearer Token**: Enviado em todas as requisições autenticadas
3. **Interceptor 401**: Auto-logout em token expirado
4. **Validação client-side**: Campos obrigatórios
5. **Mensagens genéricas**: Não expõe detalhes de falhas

### Boas Práticas

- ✅ Senhas nunca salvas em localStorage
- ✅ HTTPS recomendado em produção
- ✅ Token expirado tratado automaticamente
- ✅ Limpeza completa no logout/erro 401

## 🎨 Design System

### Cores FinEx

- **Primary**: Orange-600 (`#ea580c`)
- **Hover**: Orange-700 (`#c2410c`)
- **Background**: Slate-50 (`#f8fafc`)
- **Text**: Slate-900/600

### Componentes Utilizados

- `Card` (shadcn/ui)
- `Input` (shadcn/ui)
- `Label` (shadcn/ui)
- `Button` (shadcn/ui)
- `Alert` (shadcn/ui)
- `Loader2` (lucide-react)

## 📚 Próximos Passos

- [ ] Implementar página de cadastro
- [ ] Adicionar "Esqueci minha senha"
- [ ] Implementar refresh token
- [ ] Adicionar proteção de rotas (PrivateRoute)
- [ ] Implementar logout
- [ ] Adicionar validação de email (regex)
- [ ] Implementar "Lembrar-me"

## 🤝 Contribuindo

Este módulo segue:
- ✅ TDD (Test-Driven Development)
- ✅ MVVM (Model-View-ViewModel)
- ✅ Clean Code
- ✅ TypeScript strict mode
- ✅ Componentes presentacionais

---

**Desenvolvido com ❤️ para FinEx**
