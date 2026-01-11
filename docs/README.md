# 📚 Documentação FinEx

Índice completo da documentação do projeto.

---

## 🎯 DOCUMENTAÇÃO PARA APRESENTAÇÃO EXECUTIVA

> **Novo!** Material completo para demonstrar o sistema a investidores/empresários não-técnicos

### [📖 Índice de Apresentação](./INDICE-APRESENTACAO.md)
**Hub central** de todos os documentos de apresentação executiva.

**Use quando:** Preparar apresentação para investidor/empresário não-técnico

### [📋 Guia de Apresentação Executiva](./APRESENTACAO-EXECUTIVA.md)
Roteiro completo da apresentação (20 min) com o que dizer, como traduzir jargões e frases de impacto.

### [🎬 Script de Demonstração](./SCRIPT-DEMO-EXECUTIVA.md)
Passo a passo prático: comandos exatos, arquivos para mostrar, transições entre tópicos.

### [📄 Cheat Sheet](./CHEATSHEET-APRESENTACAO.md)
Cola de 1 página: números chave, tradutor de jargões, frases prontas. **Imprima e tenha ao lado!**

### [❓ FAQ para Investidor](./FAQ-INVESTIDOR.md)
Respostas preparadas para perguntas sobre custo, segurança, escalabilidade, ROI, tecnologias.

### [🎨 Slides Visuais ASCII](./SLIDES-VISUAIS-ASCII.md)
Diagramas visuais: arquitetura, segurança, qualidade, pipeline, ROI. Use em tela cheia!

### [✅ Checklist Pré-Reunião](./CHECKLIST-PRE-REUNIAO.md)
30 minutos antes: setup técnico, arquivos preparados, métricas decoradas, mindset correto.

### [📧 Email Follow-Up](./EMAIL-FOLLOW-UP.md)
Modelo de email pós-reunião com resumo executivo e próximos passos.

### [📊 Resumo Executivo 1 Página](./RESUMO-EXECUTIVO-1PAGINA.md)
Visão geral rápida: segurança, arquitetura, qualidade, escalabilidade, ROI. Formato compacto.

---

## 🚀 Para Começar

### [Quick Start](./QUICKSTART.md)
Guia rápido para rodar o backend em 3 passos. Perfeito se você quer começar imediatamente.

**Conteúdo:**
- Instalação de dependências
- Configuração do banco de dados
- Primeira execução
- Testes da API

---

## 📖 Arquitetura e Implementação

### [Resumo do Projeto](./PROJECT-SUMMARY.md)
Visão técnica completa de tudo que foi implementado.

**Conteúdo:**
- Componentes implementados (70 testes)
- Domain Layer (Value Objects, Entities, Events)
- Application Layer (Use Cases, DTOs)
- Infrastructure Layer (TypeORM, JWT)
- Presentation Layer (Controllers, ViewModels)
- Arquitetura DDD + Clean Architecture
- Conceitos e patterns aplicados

---

## 🧪 Desenvolvimento com TDD

### [TDD Workflow](./getting-started.md)
Guia prático de como desenvolvemos seguindo Test-Driven Development.

**Conteúdo:**
- Ciclo Red-Green-Refactor
- Comandos úteis do Jest
- Estrutura de testes
- Boas práticas
- Exemplos práticos

---

## 🔐 Autenticação

### [OAuth Authentication Plan](./authentication-plan.md)
Planejamento completo da autenticação social (Phase 2).

**Conteúdo:**
- Estratégia OAuth 2.0
- Sprints de implementação
- Providers (Google, GitHub, Facebook)
- Endpoints da API
- Fluxo de autenticação
- Account linking

### [OAuth Reference Guide](./oauth-reference.md)
Guia técnico detalhado de implementação OAuth.

**Conteúdo:**
- Configuração do Passport
- Strategies específicas por provider
- Environment variables necessárias
- Código de exemplo
- Troubleshooting

---

## 📂 Estrutura por Camada

### Domain Layer
Localização: `backend/src/modules/authentication/domain/`

**Componentes:**
- **Entities**: User (Aggregate Root)
- **Value Objects**: Email, Password, UserRole
- **Events**: UserCreatedEvent
- **Ports**: IUserRepository, ITokenService

**Documentação:** Ver [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md#domain-layer)

### Application Layer
Localização: `backend/src/modules/authentication/application/`

**Componentes:**
- **Use Cases**: SignUpUseCase, SignInUseCase
- **DTOs**: SignUpDTO, SignInDTO, AuthResponseDTO

**Documentação:** Ver [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md#application-layer)

### Infrastructure Layer
Localização: `backend/src/modules/authentication/infrastructure/`

**Componentes:**
- **Persistence**: UserSchema, UserMapper, UserRepository
- **Adapters**: JwtTokenService
- **Module**: AuthenticationModule

**Documentação:** Ver [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md#infrastructure-layer)

### Presentation Layer
Localização: `backend/src/modules/authentication/presentation/`

**Componentes:**
- **Controllers**: AuthController
- **ViewModels**: SignUpViewModel, SignInViewModel, AuthResponseViewModel

**Documentação:** Ver [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md#presentation-layer)

---

## 🎯 Guias por Caso de Uso

### Como registrar um novo usuário?
1. Ver [QUICKSTART.md](./QUICKSTART.md#testar-api) para exemplo de request
2. Ver `SignUpUseCase` em [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)
3. Validações: Password policy, Email format, UserRole enum

### Como fazer login?
1. Ver [QUICKSTART.md](./QUICKSTART.md#testar-api) para exemplo de request
2. Ver `SignInUseCase` em [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)
3. Retorna JWT token para autenticação

### Como adicionar autenticação social?
1. Ver [authentication-plan.md](./authentication-plan.md) para estratégia
2. Ver [oauth-reference.md](./oauth-reference.md) para implementação
3. Phase 2 - após autenticação local completa

---

## 🧰 Referências Técnicas

### Validações Implementadas

**Password:**
- Mínimo 8 caracteres
- Pelo menos 1 maiúscula
- Pelo menos 1 minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial (!@#$%^&*)
- Hash bcrypt com 10 salt rounds

**Email:**
- Formato válido (regex)
- Normalização (lowercase + trim)

**UserRole:**
- Apenas: ADMIN, ENTREPRENEUR, INVESTOR
- Case-insensitive

**Name:**
- Mínimo 2 caracteres

### Comandos Úteis

```bash
# Testes
npm test                    # Todos os testes
npm run test:watch          # Watch mode
npm run test:cov            # Coverage
npm test -- authentication  # Apenas auth module

# Desenvolvimento
npm run start:dev          # Hot reload
npm run build              # Build produção
npm run lint               # ESLint

# Database
npm run migration:generate # Gerar migration
npm run migration:run      # Rodar migrations
```

### Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/finex
JWT_SECRET=sua-chave-segura
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
```

Ver `.env.example` no backend para template completo.

---

## 🔍 Troubleshooting

### Erro de conexão com banco
**Solução:** Ver [QUICKSTART.md](./QUICKSTART.md#configurar-banco-de-dados)

### Testes falhando
**Solução:**
```bash
npm run test -- --clearCache
rm -rf node_modules && npm install
```

### Import errors
**Solução:** Verificar paths relativos, estrutura de pastas deve estar:
```
modules/authentication/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

---

## 📊 Métricas do Projeto

- **Total de testes**: 70 ✅
- **Cobertura**: 100% (domain + application)
- **Arquivos criados**: ~40
- **Linhas de código**: ~2500
- **Tempo de build**: <10s
- **Tempo de testes**: ~8s

---

## 🚧 Roadmap

### ✅ Fase 1: Autenticação Local (Completa)
- [x] Domain Layer com TDD
- [x] Application Layer com TDD
- [x] Infrastructure Layer com TDD
- [x] Presentation Layer
- [x] 70 testes passando

### 🔄 Fase 2: OAuth Social (Planejada)
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] GitHub OAuth
- [ ] Account linking

### 📋 Fase 3: Features Futuras
- [ ] Profile management
- [ ] Email verification
- [ ] Password reset
- [ ] Refresh tokens
- [ ] Rate limiting

---

## 🤝 Contribuindo

Antes de contribuir, leia:
1. [TDD Workflow](./getting-started.md) - Nossa metodologia
2. [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) - Arquitetura atual
3. Mantenha os testes sempre passando
4. Siga o padrão Red-Green-Refactor
5. Use SOLID e Clean Code

---

## 📞 Suporte

- **Backend README**: [../backend/README.md](../backend/README.md)
- **Issues**: GitHub Issues
- **Dúvidas sobre TDD**: [getting-started.md](./getting-started.md)
- **Dúvidas sobre OAuth**: [oauth-reference.md](./oauth-reference.md)

---

**Última atualização**: Dezembro 2025  
**Status**: ✅ 70 testes passando | Pronto para desenvolvimento
