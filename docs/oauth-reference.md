# OAuth 2.0 Social Authentication - Referência

## 🌐 Visão Geral

OAuth 2.0 permite que usuários façam login usando suas contas existentes em serviços como Google, GitHub e Facebook, sem criar nova senha.

## 📋 Configuração dos Providers (Fase 2 - FUTURO)

### 1. Google OAuth 2.0

#### Obter Credenciais:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Vá para "APIs & Services" → "Credentials"
4. Clique "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure "Authorized redirect URIs":
   - Dev: `http://localhost:3000/api/auth/google/callback`
   - Prod: `https://seudominio.com/api/auth/google/callback`

#### Variáveis de Ambiente:
```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

#### Passport Strategy:
```typescript
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
```

---

### 2. GitHub OAuth 2.0

#### Obter Credenciais:
1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique "New OAuth App"
3. Preencha:
   - Application name: "FinEx"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`

#### Variáveis de Ambiente:
```env
GITHUB_CLIENT_ID=Iv1.abcd1234efgh5678
GITHUB_CLIENT_SECRET=your_github_secret_here
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

#### Passport Strategy:
```typescript
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { username, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      username,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
```

---

## 🏗️ Estrutura de Implementação

### Entidade: SocialAccount

```typescript
// domain/entities/social-account.ts
interface SocialAccountProps {
  userId: UniqueEntityID;
  provider: SocialProvider; // GOOGLE | GITHUB | FACEBOOK
  providerId: string;
  email: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
}

export class SocialAccount extends Entity<SocialAccountProps> {
  // ...
}
```

### Value Object: SocialProvider

```typescript
// domain/value-objects/social-provider.ts
export enum SocialProviderEnum {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  APPLE = 'APPLE',
}

export class SocialProvider extends ValueObject<{ value: SocialProviderEnum }> {
  // ...
}
```

---

## 📡 Endpoints OAuth

### Google
```typescript
@Controller('auth')
export class AuthController {
  // Inicia OAuth flow
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  // Callback após autenticação
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req) {
    // Criar/encontrar usuário
    // Retornar JWT próprio
    return { token: 'jwt_token', user: req.user };
  }
}
```

### GitHub
```typescript
@Get('github')
@UseGuards(AuthGuard('github'))
async githubAuth() {}

@Get('github/callback')
@UseGuards(AuthGuard('github'))
async githubAuthCallback(@Req() req) {
  return { token: 'jwt_token', user: req.user };
}
```

### Apple
```typescript
@Get('apple')
@UseGuards(AuthGuard('apple'))
async appleAuth() {}

@Post('apple/callback')
@UseGuards(AuthGuard('apple'))
async appleAuthCallback(@Req() req) {
  return { token: 'jwt_token', user: req.user };
}
```

---

## 🔄 Fluxo Completo

```
┌─────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│         │         │          │         │          │         │          │
│ Frontend│────────▶│  Backend │────────▶│  Google  │────────▶│  Backend │
│         │  (1)    │          │  (2)    │  OAuth   │  (3)    │          │
│         │         │          │         │          │         │          │
└─────────┘         └──────────┘         └──────────┘         └──────────┘
     ▲                                                               │
     │                                                               │
     └───────────────────────────────────────────────────────────────┘
                            (4) JWT Token

1. User clica "Login com Google"
2. Backend redireciona para Google OAuth
3. Google autentica e chama callback
4. Backend cria/encontra user e retorna JWT próprio
```

---

## 🛡️ Segurança

### Pontos Importantes:
1. **Nunca exponha secrets no frontend**
2. **Use HTTPS em produção**
3. **Valide tokens OAuth no backend**
4. **Armazene tokens de forma segura**
5. **Implemente rate limiting**
6. **Use PKCE (Proof Key for Code Exchange) quando possível**

### Validação de Email OAuth:
```typescript
// Sempre valide que o email do OAuth está verificado
if (!profile.email_verified) {
  throw new UnauthorizedException('Email not verified');
}
```

---

## 🧪 Testes de OAuth

```typescript
describe('GoogleAuthStrategy', () => {
  it('should validate and return user data', async () => {
    const profile = {
      emails: [{ value: 'user@gmail.com' }],
      name: { givenName: 'John', familyName: 'Doe' },
      photos: [{ value: 'https://photo.url' }],
    };

    const result = await strategy.validate(
      'access_token',
      'refresh_token',
      profile,
      done,
    );

    expect(result.email).toBe('user@gmail.com');
    expect(result.firstName).toBe('John');
  });
});
```

---

## 📚 Recursos Úteis

### Documentação Oficial:
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)

### NestJS + Passport:
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport Strategies](http://www.passportjs.org/packages/)

---

**⚠️ LEMBRETE**: Implementaremos OAuth apenas na **Fase 2**, após completar a autenticação local com TDD!
