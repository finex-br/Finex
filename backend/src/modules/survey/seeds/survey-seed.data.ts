/**
 * Dados de exemplo para desenvolvimento e testes do módulo Survey
 * 
 * Para usar:
 * 1. Iniciar o backend
 * 2. Chamar os endpoints na ordem correta
 * 3. Ou criar um script de seed que use esses dados
 */

export const SAMPLE_SURVEY = {
  title: 'Diagnóstico Empresarial 360°',
  description: 'Questionário completo para avaliar maturidade empresarial em diversos aspectos: financeiro, operacional, estratégico e tecnológico.',
};

export const SAMPLE_SURVEY_VERSION = {
  effectiveDate: new Date('2024-01-01'),
  questions: [
    // Página 1 - Informações Básicas
    {
      text: 'Qual é o setor principal de atuação da sua empresa?',
      type: 'DROPDOWN',
      options: [
        'Tecnologia da Informação',
        'Varejo e E-commerce',
        'Indústria e Manufatura',
        'Serviços Financeiros',
        'Serviços Profissionais',
        'Saúde e Bem-estar',
        'Educação',
        'Construção Civil',
        'Agronegócio',
        'Outros',
      ],
      orderIndex: 1,
    },
    {
      text: 'Qual é o CNPJ da sua empresa?',
      type: 'CNPJ',
      orderIndex: 2,
    },
    {
      text: 'Quantos funcionários a empresa possui atualmente?',
      type: 'NUMBER',
      orderIndex: 3,
    },
    {
      text: 'Qual é o faturamento mensal médio da empresa?',
      type: 'DROPDOWN',
      options: [
        'Até R$ 50.000',
        'R$ 50.001 a R$ 100.000',
        'R$ 100.001 a R$ 300.000',
        'R$ 300.001 a R$ 500.000',
        'R$ 500.001 a R$ 1.000.000',
        'Acima de R$ 1.000.000',
      ],
      orderIndex: 4,
    },
    {
      text: 'Há quanto tempo a empresa está em operação?',
      type: 'DROPDOWN',
      options: [
        'Menos de 1 ano',
        '1 a 2 anos',
        '2 a 5 anos',
        '5 a 10 anos',
        'Mais de 10 anos',
      ],
      orderIndex: 5,
    },

    // Página 2 - Gestão Financeira
    {
      text: 'A empresa utiliza algum sistema de gestão financeira?',
      type: 'DROPDOWN',
      options: [
        'Sim, ERP completo',
        'Sim, sistema específico de finanças',
        'Sim, planilhas Excel',
        'Não utiliza nenhum sistema estruturado',
      ],
      orderIndex: 6,
    },
    {
      text: 'Com que frequência são feitas análises de fluxo de caixa?',
      type: 'DROPDOWN',
      options: [
        'Diariamente',
        'Semanalmente',
        'Mensalmente',
        'Raramente ou nunca',
      ],
      orderIndex: 7,
    },
    {
      text: 'A empresa possui reserva de emergência (capital de giro)?',
      type: 'DROPDOWN',
      options: [
        'Sim, suficiente para 6+ meses',
        'Sim, suficiente para 3-6 meses',
        'Sim, suficiente para 1-3 meses',
        'Não possui reserva',
      ],
      orderIndex: 8,
    },
    {
      text: 'Descreva os principais desafios financeiros da empresa atualmente:',
      type: 'TEXT',
      orderIndex: 9,
    },
    {
      text: 'Faça upload dos últimos 3 balanços patrimoniais (se disponível):',
      type: 'FILE_UPLOAD',
      orderIndex: 10,
    },

    // Página 3 - Estratégia e Planejamento
    {
      text: 'A empresa possui um planejamento estratégico documentado?',
      type: 'DROPDOWN',
      options: [
        'Sim, com metas claras e revisão periódica',
        'Sim, mas pouco estruturado',
        'Em desenvolvimento',
        'Não possui',
      ],
      orderIndex: 11,
    },
    {
      text: 'Com que frequência as metas estratégicas são revisadas?',
      type: 'DROPDOWN',
      options: [
        'Mensalmente',
        'Trimestralmente',
        'Anualmente',
        'Não são revisadas regularmente',
      ],
      orderIndex: 12,
    },
    {
      text: 'A empresa utiliza indicadores de desempenho (KPIs)?',
      type: 'DROPDOWN',
      options: [
        'Sim, múltiplos KPIs monitorados regularmente',
        'Sim, alguns KPIs básicos',
        'Estamos implementando',
        'Não utilizamos',
      ],
      orderIndex: 13,
    },
    {
      text: 'Quantos produtos ou serviços principais a empresa oferece?',
      type: 'NUMBER',
      orderIndex: 14,
    },
    {
      text: 'Descreva a principal vantagem competitiva da sua empresa:',
      type: 'TEXT',
      orderIndex: 15,
    },

    // Página 4 - Processos e Operações
    {
      text: 'Os principais processos da empresa estão documentados?',
      type: 'DROPDOWN',
      options: [
        'Sim, todos documentados e atualizados',
        'Sim, parcialmente documentados',
        'Em processo de documentação',
        'Não estão documentados',
      ],
      orderIndex: 16,
    },
    {
      text: 'A empresa utiliza metodologias de melhoria contínua?',
      type: 'DROPDOWN',
      options: [
        'Sim, Lean/Six Sigma ou similar',
        'Sim, práticas informais',
        'Estamos implementando',
        'Não utilizamos',
      ],
      orderIndex: 17,
    },
    {
      text: 'Qual é o nível de automação dos processos operacionais?',
      type: 'DROPDOWN',
      options: [
        'Alto - Maioria dos processos automatizados',
        'Médio - Automação parcial',
        'Baixo - Principalmente manual',
        'Sem automação',
      ],
      orderIndex: 18,
    },
    {
      text: 'Qual é o tempo médio de entrega do produto/serviço ao cliente (em dias)?',
      type: 'NUMBER',
      orderIndex: 19,
    },
    {
      text: 'Descreva os principais gargalos operacionais:',
      type: 'TEXT',
      orderIndex: 20,
    },

    // Página 5 - Tecnologia e Inovação
    {
      text: 'A empresa investe em pesquisa e desenvolvimento?',
      type: 'DROPDOWN',
      options: [
        'Sim, regularmente com orçamento dedicado',
        'Sim, ocasionalmente',
        'Raramente',
        'Não investe',
      ],
      orderIndex: 21,
    },
    {
      text: 'Qual é o nível de maturidade digital da empresa?',
      type: 'DROPDOWN',
      options: [
        'Avançado - Totalmente digital',
        'Intermediário - Em transformação digital',
        'Básico - Uso limitado de tecnologia',
        'Inicial - Predominantemente analógico',
      ],
      orderIndex: 22,
    },
    {
      text: 'A empresa utiliza dados para tomada de decisão?',
      type: 'DROPDOWN',
      options: [
        'Sim, análise avançada de dados (BI/Analytics)',
        'Sim, análises básicas',
        'Raramente',
        'Não utiliza',
      ],
      orderIndex: 23,
    },
    {
      text: 'Quantos sistemas/softwares diferentes a empresa utiliza?',
      type: 'NUMBER',
      orderIndex: 24,
    },
    {
      text: 'Faça upload de documentos relevantes sobre infraestrutura tecnológica:',
      type: 'FILE_UPLOAD',
      orderIndex: 25,
    },
  ],
};

export const SAMPLE_ANSWERS = {
  // Exemplo de respostas para teste
  page1: [
    {
      questionIndex: 1,
      value: { selected: 'Tecnologia da Informação' },
      comment: 'Atuamos com desenvolvimento de software B2B',
    },
    {
      questionIndex: 2,
      value: { cnpj: '12.345.678/0001-90' },
    },
    {
      questionIndex: 3,
      value: { number: 45 },
    },
    {
      questionIndex: 4,
      value: { selected: 'R$ 300.001 a R$ 500.000' },
    },
    {
      questionIndex: 5,
      value: { selected: '2 a 5 anos' },
    },
  ],
  page2: [
    {
      questionIndex: 6,
      value: { selected: 'Sim, sistema específico de finanças' },
    },
    {
      questionIndex: 7,
      value: { selected: 'Semanalmente' },
    },
    {
      questionIndex: 8,
      value: { selected: 'Sim, suficiente para 3-6 meses' },
    },
    {
      questionIndex: 9,
      value: {
        text: 'Principais desafios incluem: 1) Previsibilidade de receita devido a contratos anuais, 2) Gestão de inadimplência, 3) Controle de custos com crescimento da equipe.',
      },
    },
    {
      questionIndex: 10,
      value: { fileIds: [] }, // Seria preenchido após upload
      comment: 'Arquivos serão enviados posteriormente',
    },
  ],
};

export const TEST_SCENARIOS = {
  completeFlow: {
    description: 'Fluxo completo: criar survey → criar versão → responder → completar',
    steps: [
      '1. POST /api/admin/surveys - Criar survey',
      '2. POST /api/admin/surveys/versions - Criar versão com 25 perguntas',
      '3. POST /api/surveys/{surveyId}/start - Iniciar assessment',
      '4. GET /api/surveys/assessments/{id}/questions?page=1 - Buscar primeira página',
      '5. POST /api/surveys/assessments/{id}/answers - Enviar respostas da página 1',
      '6. GET /api/surveys/assessments/{id}/questions?page=2 - Buscar segunda página',
      '7. POST /api/surveys/assessments/{id}/answers - Enviar respostas da página 2',
      '8. Repetir para páginas 3, 4 e 5',
      '9. POST /api/surveys/assessments/{id}/complete - Finalizar assessment',
    ],
  },
  resumeFlow: {
    description: 'Fluxo de retomada: responder parcialmente → sair → retomar',
    steps: [
      '1. Iniciar assessment',
      '2. Responder apenas primeira página',
      '3. Sair do sistema',
      '4. GET /api/surveys/pending - Verificar que survey aparece com progress',
      '5. POST /api/surveys/{surveyId}/start - Retomar (isResuming=true)',
      '6. Continuar de onde parou',
    ],
  },
  validationFlow: {
    description: 'Testar validações de cada tipo de pergunta',
    steps: [
      '1. Tentar enviar CNPJ inválido - deve falhar',
      '2. Tentar enviar NUMBER com texto - deve falhar',
      '3. Tentar enviar DROPDOWN com opção não existente - deve falhar',
      '4. Tentar completar sem 100% - deve falhar',
    ],
  },
};
