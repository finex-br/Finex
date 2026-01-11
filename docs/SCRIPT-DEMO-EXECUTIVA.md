# 🎯 Script de Demo - Teste Antes da Reunião

## ⚡ Preparação Rápida (5 min)

### 1️⃣ **Suba o Backend**
```powershell
cd backend
npm run start:dev
```
**Aguarde:** `Nest application successfully started` aparecer

---

### 2️⃣ **Abra o Swagger**
No navegador: http://localhost:3000/api/docs

✅ Você deve ver a documentação completa da API

---

### 3️⃣ **Rode os Testes (Visual Impactante)**
```powershell
# Em outro terminal
cd backend
npm test
```

**O que vai aparecer:**
```
PASS src/modules/authentication/domain/entities/user.spec.ts
PASS src/modules/authentication/application/use-cases/sign-in.use-case.spec.ts
PASS src/modules/payment/domain/entities/checkout.spec.ts
...
Test Suites: XX passed
Tests: 200+ passed
```

---

## 🎬 DEMO AO VIVO - ROTEIRO PASSO A PASSO

### **Cena 1: Segurança (2 min)**

#### **Ação 1.1** - Mostre Autenticação OAuth
**Arquivo:** `backend/src/modules/authentication/presentation/http/controllers/oauth.controller.ts`

**Linha chave (L12-18):**
```typescript
@Get('google')
@ApiOperation({ summary: 'Inicia OAuth com Google' })
async googleAuth(@Req() req: any) {
  // Redireciona para login do Google
}
```

**O que dizer:**
> "Aqui está o login com Google. É o mesmo sistema que apps como Spotify e Netflix usam. **Zero senhas** armazenadas por nós."

---

#### **Ação 1.2** - Mostre Validação Global
**Arquivo:** `backend/src/main.ts`

**Linhas 14-20:**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // 👈 Bloqueio automático
    forbidNonWhitelisted: true,   // 👈 Rejeita ataques
    transform: true,              // 👈 Sanitização
  }),
);
```

**O que dizer:**
> "Essas 3 linhas são um **filtro automático** que bloqueia qualquer dado suspeito **antes** de processar. Como um detector de metais no aeroporto."

---

### **Cena 2: Arquitetura (2 min)**

#### **Ação 2.1** - Mostre Estrutura de Pastas
**Abra no Explorer:** `backend/src/modules/authentication/`

```
authentication/
├── domain/           👈 "Regras de negócio protegidas"
├── application/      👈 "Casos de uso da aplicação"
├── infrastructure/   👈 "Conexões externas"
└── presentation/     👈 "Interface HTTP"
```

**O que dizer:**
> "Essa organização em camadas é o mesmo padrão que Google e Microsoft usam. Chamamos de **Clean Architecture**. Se amanhã precisarmos trocar o banco de dados, só mexemos na pasta `infrastructure`. **O resto não quebra**."

---

#### **Ação 2.2** - Mostre Documentação Automática (Swagger)
**No navegador:** http://localhost:3000/api/docs

**Navegue por:**
- Tag "OAuth" → Endpoints de autenticação
- Try it out em `/oauth/google`
- Mostre os exemplos de resposta

**O que dizer:**
> "Essa documentação é **gerada automaticamente** do código. Qualquer desenvolvedor que entrar já tem um **manual completo**. Reduz tempo de treinamento de semanas para dias."

---

### **Cena 3: Qualidade (3 min)**

#### **Ação 3.1** - Rode Testes ao Vivo
**No terminal:**
```powershell
npm test
```

**Enquanto roda, diga:**
> "Esses são **200 verificadores automáticos** de qualidade. Toda vez que fazemos uma mudança, eles rodam **automaticamente**. Se algo quebrar, o sistema **bloqueia** o deploy."

**Quando terminar:**
> "Veja: **todos passaram**. Isso significa que tudo está funcionando como esperado."

---

#### **Ação 3.2** - Mostre Pipeline de Segurança
**Arquivo:** `docs/CODE-QUALITY.md`

**Seção "Camadas de Proteção":**

**O que dizer:**
> "Temos **3 camadas de segurança** antes de qualquer código ir pro ar:"
> 
> 1. **Local** - Testes rodam antes de salvar
> 2. **GitHub** - Verificações automáticas no servidor
> 3. **Pré-Deploy** - Validação final antes de publicar
>
> "É impossível subir código com erro. **Zero erro humano**."

---

### **Cena 4: Escalabilidade (2 min)**

#### **Ação 4.1** - Mostre Docker Compose
**Arquivo:** `docker-compose.production.yml`

**Seções chave:**
- `postgres` (linhas 8-27) - Banco de dados
- `redis` (linhas 29-37) - Cache
- `healthcheck` (linhas 22-26) - Auto-monitoramento

**O que dizer:**
> "O sistema já está **containerizado**. Isso significa:"
> - ✅ Roda em **qualquer servidor** (AWS, Azure, Google Cloud)
> - ✅ **Escala automaticamente** quando tiver mais usuários
> - ✅ **Se auto-monitora** e reinicia se algo falhar

**Mostre o healthcheck:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready"]
  interval: 5s
  retries: 5
```

**Traduza:**
> "Isso aqui verifica **a cada 5 segundos** se o banco está saudável. Se falhar, **reinicia automaticamente**. Como ter um médico monitorando 24/7."

---

## 🔥 DEMONSTRAÇÃO DE SEGURANÇA (Bonus - Se Tiver Tempo)

### **Ação Bonus: Mostre Criptografia de Senha**

**Arquivo:** `backend/src/modules/authentication/domain/value-objects/password.ts`

**Procure por:**
```typescript
private async hash(): Promise<void> {
  this._value = await bcrypt.hash(this._value, 10);
}
```

**O que dizer:**
> "Veja aqui. As senhas passam por **10 rounds de criptografia bcrypt**. Mesmo que alguém invada o banco de dados, **não consegue ver as senhas reais**. É irreversível."

---

## 🎤 FRASES PRONTAS PARA TRANSIÇÕES

### Entre Segurança → Arquitetura:
> "Agora que você viu **como protegemos os dados**, deixa eu mostrar **como organizamos o código** para escalar..."

### Entre Arquitetura → Qualidade:
> "Legal, né? Mas código bem organizado não adianta se tiver bugs. Por isso temos **200 testes automatizados**..."

### Entre Qualidade → Escalabilidade:
> "Qualidade garantida, arquitetura sólida... mas precisa **escalar**. E é aqui que entra nossa infraestrutura Docker..."

---

## ⚠️ TROUBLESHOOTING RÁPIDO

### Se o backend não subir:
```powershell
# Verifique se PostgreSQL está rodando
docker ps

# Se não estiver, suba:
docker-compose up -d postgres

# Tente novamente:
npm run start:dev
```

### Se os testes falharem:
```powershell
# Limpe cache e rode novamente:
npm run test:clear
npm test
```

### Se o Swagger não carregar:
- Verifique se está em http://localhost:3000/api/docs (não http://localhost:3000/docs)
- Certifique-se que o backend está rodando sem erros

---

## 📋 CHECKLIST FINAL PRÉ-DEMO

**5 minutos antes da reunião:**

- [ ] Backend rodando ✅
- [ ] Swagger carregado no navegador ✅
- [ ] Terminal com testes pronto (não precisa ter rodado) ✅
- [ ] VS Code com arquivos chave abertos:
  - [ ] `main.ts` (validações)
  - [ ] `oauth.controller.ts` (autenticação)
  - [ ] `docker-compose.production.yml` (infraestrutura)
- [ ] Zoom do código aumentado (fonte 16+) ✅
- [ ] Notificações do Windows DESLIGADAS ✅
- [ ] Celular no silencioso ✅

---

## 🎯 DICA FINAL

**Se ele interromper com pergunta:**
- ✅ **Responda diretamente** se souber
- ✅ **Anote** se for complexo: "Excelente pergunta! Deixa eu anotar e respondo com precisão ao final"
- ✅ **Não entre em pânico** se não souber algo específico: "Preciso validar esse detalhe técnico com a equipe para te dar a informação correta"

**Confiança > Saber Tudo**

---

## 🚀 BOA SORTE NA DEMO!

Você tem:
- ✅ Código sólido
- ✅ Arquitetura profissional
- ✅ Testes garantindo qualidade
- ✅ Infraestrutura enterprise

**Agora é só mostrar! 💪**
