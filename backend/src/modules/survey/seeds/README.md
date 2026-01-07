# 📦 Survey Seeds - Dados de Exemplo

## 🎯 Propósito

Este diretório contém dados de exemplo para desenvolvimento e teste do módulo Survey.

## 📋 Conteúdo

### `survey-seed.data.ts`

Contém dados prontos para criar um survey completo de exemplo:

- **SAMPLE_SURVEY**: Survey "Diagnóstico Empresarial 360°"
- **SAMPLE_SURVEY_VERSION**: Versão com 25 perguntas divididas em 5 páginas
- **SAMPLE_ANSWERS**: Exemplos de respostas para teste
- **TEST_SCENARIOS**: Cenários de teste documentados

## 🚀 Como Usar

### Opção 1: Via API (Manualmente)

1. Inicie o backend:
```bash
npm run start:dev
```

2. Use os dados de `SAMPLE_SURVEY` para criar o survey:
```bash
curl -X POST http://localhost:3000/api/admin/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Diagnóstico Empresarial 360°",
    "description": "Questionário completo para avaliar maturidade empresarial..."
  }'
```

3. Use o `surveyId` retornado e os dados de `SAMPLE_SURVEY_VERSION` para criar a versão:
```bash
curl -X POST http://localhost:3000/api/admin/surveys/versions \
  -H "Content-Type: application/json" \
  -d '{ "surveyId": "seu-survey-id", "questions": [...] }'
```

### Opção 2: Criar Script de Seed (Recomendado)

Crie um arquivo `seed-surveys.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CreateSurveyUseCase } from './modules/survey/application/use-cases/create-survey/create-survey.use-case';
import { CreateSurveyVersionUseCase } from './modules/survey/application/use-cases/create-survey-version/create-survey-version.use-case';
import { SAMPLE_SURVEY, SAMPLE_SURVEY_VERSION } from './modules/survey/seeds/survey-seed.data';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const createSurveyUseCase = app.get(CreateSurveyUseCase);
  const createVersionUseCase = app.get(CreateSurveyVersionUseCase);

  // Criar survey
  console.log('Criando survey...');
  const surveyResult = await createSurveyUseCase.execute(SAMPLE_SURVEY);
  
  if (surveyResult.isFailure) {
    console.error('Erro ao criar survey:', surveyResult.error);
    await app.close();
    return;
  }

  const { surveyId } = surveyResult.getValue();
  console.log('✅ Survey criado:', surveyId);

  // Criar versão
  console.log('Criando versão com perguntas...');
  const versionResult = await createVersionUseCase.execute({
    surveyId,
    ...SAMPLE_SURVEY_VERSION,
  });

  if (versionResult.isFailure) {
    console.error('Erro ao criar versão:', versionResult.error);
    await app.close();
    return;
  }

  const { versionId, questionCount } = versionResult.getValue();
  console.log(`✅ Versão criada: ${versionId} com ${questionCount} perguntas`);

  await app.close();
}

bootstrap();
```

Execute:
```bash
npm run build
node dist/seed-surveys.js
```

## 📊 Estrutura do Survey de Exemplo

### Página 1: Informações Básicas (5 perguntas)
- Setor de atuação (DROPDOWN)
- CNPJ (CNPJ)
- Número de funcionários (NUMBER)
- Faturamento mensal (DROPDOWN)
- Tempo de operação (DROPDOWN)

### Página 2: Gestão Financeira (5 perguntas)
- Sistema de gestão (DROPDOWN)
- Frequência de análise (DROPDOWN)
- Reserva de emergência (DROPDOWN)
- Desafios financeiros (TEXT)
- Upload de balanços (FILE_UPLOAD)

### Página 3: Estratégia e Planejamento (5 perguntas)
- Planejamento estratégico (DROPDOWN)
- Revisão de metas (DROPDOWN)
- Uso de KPIs (DROPDOWN)
- Quantidade de produtos (NUMBER)
- Vantagem competitiva (TEXT)

### Página 4: Processos e Operações (5 perguntas)
- Documentação de processos (DROPDOWN)
- Melhoria contínua (DROPDOWN)
- Nível de automação (DROPDOWN)
- Tempo de entrega (NUMBER)
- Gargalos operacionais (TEXT)

### Página 5: Tecnologia e Inovação (5 perguntas)
- Investimento em P&D (DROPDOWN)
- Maturidade digital (DROPDOWN)
- Uso de dados (DROPDOWN)
- Quantidade de sistemas (NUMBER)
- Upload de docs (FILE_UPLOAD)

## 🧪 Cenários de Teste

### 1. Fluxo Completo
Testa o ciclo completo desde criação até conclusão do assessment.

### 2. Fluxo de Retomada
Testa a capacidade de salvar progresso e retomar posteriormente.

### 3. Fluxo de Validação
Testa todas as validações de tipos de perguntas.

Veja detalhes em `TEST_SCENARIOS` no arquivo `survey-seed.data.ts`.

## 💡 Dicas

- Use Postman ou Insomnia para testar os endpoints
- Salve o `surveyId` e `assessmentId` para reusar nos testes
- Teste a paginação navegando entre as páginas
- Teste o auto-save enviando respostas parciais
- Verifique o progresso após cada envio de respostas
