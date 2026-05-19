// @ts-check
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

const MODULES = ['auth', 'moeda', 'aluno', 'professor', 'parceiro', 'instituicao', 'vantagem'];

/**
 * Gera padrões proibidos: módulo X não pode importar das camadas internas de módulo Y.
 * Camadas permitidas entre módulos: apenas src/shared/.
 */
function crossModulePatterns(forModule) {
  return MODULES.filter((m) => m !== forModule).flatMap((other) => [
    `**/${other}/application/**`,
    `**/${other}/domain/**`,
    `**/${other}/infra/**`,
  ]);
}

const moduleRules = Object.fromEntries(
  MODULES.map((mod) => [
    `src/modules/${mod}/**/*.ts`,
    {
      'no-restricted-imports': [
        'error',
        {
          patterns: crossModulePatterns(mod).map((pattern) => ({
            group: [pattern],
            message: `Violação de fronteira de módulo: importe apenas de shared/ ou exponha uma API pública.`,
          })),
        },
      ],
    },
  ])
);

export default [
  {
    files: ['src/**/*.ts'],
    plugins: { '@typescript-eslint': tseslint },
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: './tsconfig.json', sourceType: 'module' },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  // Regras de fronteira por módulo
  ...Object.entries(moduleRules).map(([filesGlob, rules]) => ({
    files: [filesGlob],
    rules,
  })),
];
