/**
 * Fuzzing Utilities
 * 
 * Funções reutilizáveis para gerar dados aleatórios em testes de fuzzing.
 * Use estas funções em qualquer teste que precise validar robustez contra entradas inesperadas.
 * 
 * @example
 * import { generateRandomString, generateEdgeCases } from './fuzzing-utils';
 * 
 * it('should handle random inputs', () => {
 *   const random = generateRandomString(50);
 *   expect(() => MyClass.create(random)).not.toThrow();
 * });
 */

/**
 * Caracteres ASCII incluindo especiais e de controle
 */
const ASCII_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`\'" \t\n\r\\';

/**
 * Gera uma string completamente aleatória com caracteres ASCII
 * 
 * @param length - Comprimento da string desejada
 * @returns String aleatória
 * 
 * @example
 * const random = generateRandomString(20);
 * // "aB3!@x  Kl\nPq#$"
 */
export function generateRandomString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ASCII_CHARS.charAt(Math.floor(Math.random() * ASCII_CHARS.length));
  }
  return result;
}

/**
 * Gera uma string aleatória com caracteres Unicode (0-65535)
 * Inclui emojis, caracteres especiais, e de outros idiomas
 * 
 * @param length - Comprimento da string desejada
 * @returns String Unicode aleatória
 * 
 * @example
 * const unicode = generateRandomUnicodeString(10);
 * // "中💩文ñ🚀العر"
 */
export function generateRandomUnicodeString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += String.fromCharCode(Math.floor(Math.random() * 65536));
  }
  return result;
}

/**
 * Gera uma string numérica aleatória
 * 
 * @param length - Quantidade de dígitos
 * @returns String com apenas números
 * 
 * @example
 * const numbers = generateRandomNumbers(14);
 * // "12345678901234"
 */
export function generateRandomNumbers(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Gera um número aleatório no intervalo especificado
 * 
 * @param min - Valor mínimo (inclusive)
 * @param max - Valor máximo (inclusive)
 * @returns Número aleatório
 * 
 * @example
 * const price = generateRandomNumber(0, 1000);
 * // 547.23
 */
export function generateRandomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Gera um inteiro aleatório no intervalo especificado
 * 
 * @param min - Valor mínimo (inclusive)
 * @param max - Valor máximo (inclusive)
 * @returns Inteiro aleatório
 * 
 * @example
 * const age = generateRandomInt(18, 100);
 * // 42
 */
export function generateRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Retorna uma lista abrangente de edge cases (casos extremos)
 * 
 * @returns Array com diversos tipos de valores problemáticos
 * 
 * @example
 * const edges = generateEdgeCases();
 * edges.forEach(testCase => {
 *   expect(() => MyClass.create(testCase)).not.toThrow();
 * });
 */
export function generateEdgeCases(): any[] {
  return [
    // Null e undefined
    null,
    undefined,

    // Strings vazias e whitespace
    '',
    ' ',
    '  ',
    '   ',
    '\n',
    '\t',
    '\r',
    '\r\n',
    '\v',
    '\f',

    // Caracteres especiais
    '\0',                          // Null character
    String.fromCharCode(0),        // Null byte
    '�',                          // Replacement character
    '\uFEFF',                     // Zero-width no-break space
    '\u200B',                     // Zero-width space
    '\u00A0',                     // Non-breaking space
    '\u2003',                     // Em space

    // Unicode e emojis
    '💩',
    '🚀',
    '🎉',
    '👨‍👩‍👧‍👦',                        // Family emoji (multi-codepoint)
    '中文',
    'العربية',
    'Ññ',
    'àéîôù',
    'Привет',
    '日本語',

    // Ataques comuns
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "admin'--",
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '${process.env.SECRET}',
    '#{7*7}',                     // Template injection
    '{{7*7}}',                    // Template injection

    // URL encoding
    '%00',                        // Null byte encoded
    '%0A',                        // Newline encoded
    '%0D',                        // Carriage return encoded
    '%3Cscript%3E',              // <script> encoded

    // Strings muito longas
    'A'.repeat(100),
    'A'.repeat(1000),
    'A'.repeat(10000),
    '1'.repeat(100),
    '9'.repeat(1000),

    // Números como string
    '0',
    '-1',
    '999999999999999',
    '1.7976931348623157e+308',   // Near Number.MAX_VALUE

    // Booleanos como string
    'true',
    'false',
    'TRUE',
    'FALSE',

    // Objetos e arrays (para testar type checking)
    {},
    [],
    { key: 'value' },
    [1, 2, 3],
  ];
}

/**
 * Gera mutações de uma string válida para criar inputs inválidos
 * Útil para mutation testing
 * 
 * @param input - String original
 * @returns Array de strings mutadas
 * 
 * @example
 * const mutations = mutateString('valid@email.com');
 * // ['Valid@email.com', 'valid@@email.com', 'valid@email.comm', ...]
 */
export function mutateString(input: string): string[] {
  const mutations: string[] = [];

  if (!input || input.length === 0) {
    return mutations;
  }

  // Adicionar caracteres no início e fim
  mutations.push(`${String.fromCharCode(0)}${input}`);
  mutations.push(` ${input}`);
  mutations.push(`\n${input}`);
  mutations.push(`${input} `);
  mutations.push(`${input}\n`);

  // Duplicar
  mutations.push(input + input);
  mutations.push(input.charAt(0) + input);
  mutations.push(input + input.charAt(input.length - 1));

  // Remover caracteres
  if (input.length > 1) {
    mutations.push(input.slice(1));              // Remove primeiro
    mutations.push(input.slice(0, -1));          // Remove último
    mutations.push(input.slice(0, Math.floor(input.length / 2))); // Remove metade
  }

  // Substituir caracteres
  mutations.push(input.replace(/./g, 'X'));      // Todos por X
  mutations.push(input.replace(/\d/g, 'X'));     // Números por X
  mutations.push(input.replace(/[a-zA-Z]/g, '9')); // Letras por 9

  // Duplicar caracteres especiais
  mutations.push(input.replace(/@/g, '@@'));
  mutations.push(input.replace(/\./g, '..'));
  mutations.push(input.replace(/\//g, '//'));
  mutations.push(input.replace(/-/g, '--'));

  // Case mutations
  mutations.push(input.toUpperCase());
  mutations.push(input.toLowerCase());

  // Inverter
  mutations.push(input.split('').reverse().join(''));

  return mutations;
}

/**
 * Gera mutações bit-flip de uma string
 * Útil para testes de robustez em baixo nível
 * 
 * @param input - String original
 * @param position - Posição do caractere a mutar
 * @param bitMask - Máscara de bits para XOR (padrão: 1)
 * @returns String com bit flipado
 * 
 * @example
 * const flipped = bitFlipMutation('test@example.com', 5, 1);
 * // "test!example.com" (@ flipado para !)
 */
export function bitFlipMutation(input: string, position: number, bitMask: number = 1): string {
  if (position < 0 || position >= input.length) {
    return input;
  }

  const charCode = input.charCodeAt(position);
  const flipped = String.fromCharCode(charCode ^ bitMask);
  return input.slice(0, position) + flipped + input.slice(position + 1);
}

/**
 * Gera todas as mutações bit-flip possíveis de uma string
 * 
 * @param input - String original
 * @returns Array com todas as mutações
 * 
 * @example
 * const mutations = generateAllBitFlips('test');
 * // Retorna ~100 variações com bits flipados
 */
export function generateAllBitFlips(input: string): string[] {
  const mutations: string[] = [];
  const bitMasks = [1, 2, 4, 8, 16, 32, 64, 128];

  for (let i = 0; i < input.length; i++) {
    for (const mask of bitMasks) {
      mutations.push(bitFlipMutation(input, i, mask));
    }
  }

  return mutations;
}

/**
 * Gera valores de fronteira (boundary values) para testes
 * 
 * @param type - Tipo de fronteira ('string', 'number', 'integer')
 * @returns Array com valores de fronteira
 * 
 * @example
 * const boundaries = generateBoundaryValues('integer');
 * // [0, 1, -1, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER]
 */
export function generateBoundaryValues(type: 'string' | 'number' | 'integer'): any[] {
  switch (type) {
    case 'string':
      return [
        '',
        'A',
        'AB',
        'A'.repeat(7),
        'A'.repeat(8),
        'A'.repeat(9),
        'A'.repeat(63),
        'A'.repeat(64),
        'A'.repeat(65),
        'A'.repeat(254),
        'A'.repeat(255),
        'A'.repeat(256),
      ];

    case 'number':
      return [
        0,
        -0,
        0.000001,
        -0.000001,
        1,
        -1,
        0.99,
        1.01,
        Number.MIN_VALUE,
        Number.MAX_VALUE,
        Number.EPSILON,
        -Number.EPSILON,
        NaN,
        Infinity,
        -Infinity,
      ];

    case 'integer':
      return [
        0,
        1,
        -1,
        2,
        -2,
        127,
        128,
        -128,
        -129,
        32767,
        32768,
        -32768,
        -32769,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ];

    default:
      return [];
  }
}

/**
 * Gera uma lista de CNPJs inválidos para testes
 * 
 * @returns Array de CNPJs inválidos
 */
export function generateInvalidCNPJs(): string[] {
  return [
    '',
    '123',
    '12345678901',              // Muito curto
    '123456789012345',          // Muito longo
    '00000000000000',           // Todos iguais
    '11111111111111',
    '22222222222222',
    '12345678901234',           // Check digits errados
    'ABCD5678901234',           // Letras
    '12.345.678/0001-99',       // Check digit errado
  ];
}

/**
 * Gera uma lista de emails inválidos para testes
 * 
 * @returns Array de emails inválidos
 */
export function generateInvalidEmails(): string[] {
  return [
    '',
    'invalid',
    'no-at-sign',
    '@no-local',
    'no-domain@',
    'multiple@@at.com',
    'spaces in@email.com',
    'missing.domain@',
    '@missing-local.com',
    'no-extension@domain',
    'double..dots@domain.com',
    '.starts-with-dot@domain.com',
    'ends-with-dot.@domain.com',
  ];
}

/**
 * Gera uma lista de senhas fracas para testes
 * 
 * @returns Array de senhas inválidas
 */
export function generateWeakPasswords(): string[] {
  return [
    '',
    'short',
    '1234567',                  // Muito curta
    'nouppercase1!',           // Sem maiúscula
    'NOLOWERCASE1!',           // Sem minúscula
    'NoNumbers!',              // Sem número
    'NoSpecial1',              // Sem caractere especial
    'abcdefgh',                // Sem uppercase, números, especiais
    '12345678',                // Sem letras
    '!@#$%^&*',                // Sem letras e números
  ];
}

/**
 * Executa um teste de fuzzing com um número específico de iterações
 * 
 * @param iterations - Número de iterações
 * @param testFn - Função de teste a executar
 * @param generateInput - Função que gera input aleatório
 * 
 * @example
 * runFuzzingTest(100, (input) => {
 *   expect(() => MyClass.create(input)).not.toThrow();
 * }, () => generateRandomString(50));
 */
export function runFuzzingTest(
  iterations: number,
  testFn: (input: any) => void,
  generateInput: () => any
): void {
  for (let i = 0; i < iterations; i++) {
    const input = generateInput();
    testFn(input);
  }
}

/**
 * Executa testes de fuzzing com métricas estatísticas
 * 
 * @param iterations - Número de iterações
 * @param testFn - Função que retorna true para sucesso, false para falha
 * @param generateInput - Função que gera input aleatório
 * @returns Objeto com estatísticas
 * 
 * @example
 * const stats = runStatisticalFuzzing(100, 
 *   (input) => Email.create(input).isSuccess,
 *   () => generateRandomString(20)
 * );
 * console.log(`Success rate: ${stats.successRate}%`);
 */
export function runStatisticalFuzzing(
  iterations: number,
  testFn: (input: any) => boolean,
  generateInput: () => any
): { successCount: number; failureCount: number; successRate: number; failureRate: number } {
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < iterations; i++) {
    const input = generateInput();
    const success = testFn(input);
    
    if (success) successCount++;
    else failureCount++;
  }

  return {
    successCount,
    failureCount,
    successRate: (successCount / iterations) * 100,
    failureRate: (failureCount / iterations) * 100,
  };
}
