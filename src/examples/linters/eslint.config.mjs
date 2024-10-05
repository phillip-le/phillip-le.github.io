import eslintJs from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import * as depend from 'eslint-plugin-depend';
import importX from 'eslint-plugin-import-x';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

const tsExtensions = ['ts', 'cts', 'mts', 'tsx'];

export default [
  {
    ignores: [
      '.idea/*',
      '.vscode/*',
      '**/.cdk.staging/',
      '**/.pnpm-store/',
      '**/.serverless/',
      '**/cdk.out/',
      '**/node_modules*/',
      'coverage*/',
      'dist*/',
      'lib*/',
      'tmp*/',
    ],
  },
  eslintJs.configs.recommended,
  ...[
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ].map((config) => ({
    ...config,
    files: [`**/*.{${tsExtensions}}`],
  })),
  {
    ...importX.flatConfigs.recommended,
    files: [`**/*.{${tsExtensions}}`],
  },
  {
    ...importX.flatConfigs.typescript,
    files: [`**/*.{${tsExtensions}}`],
  },
  {
    ...eslintPluginUnicorn.configs['flat/recommended'],
    files: [`**/*.{${tsExtensions}}`],
  },
  {
    ...depend.configs['flat/recommended'],
    files: [`**/*.{${tsExtensions}}`],
  },
  {
    ...eslintPluginPromise.configs['flat/recommended'],
    files: [`**/*.{${tsExtensions}}`],
  },
  {
    files: [`**/*.{${tsExtensions}}`],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // ESLint native rules
    files: [`**/*.{${tsExtensions}}`],
    rules: {
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-useless-assignment': 'error',
      eqeqeq: 'error',
      'no-implicit-coercion': 'error',
      'no-throw-literal': 'error',
      'no-unneeded-ternary': 'error',
      'no-var': 'error',
      'no-useless-rename': 'error',
      'no-useless-concat': 'error',
      'object-shorthand': 'error',
      'no-else-return': [
        'error',
        {
          allowElseIf: false,
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration[const=true]',
          message:
            'const enum is not allowed due to several pitfalls https://www.typescriptlang.org/docs/handbook/enums.html#const-enum-pitfalls. Use a regular enum or object literal instead.',
        },
        {
          selector: 'TSEnumMember > Literal[raw=/^[0-9]+$/]',
          message:
            'Enum with numeric values is not allowed due to unintuitive behavior https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings. Use string values or object literal instead.',
        },
      ],
    },
  },
  {
    // typescript-eslint rules
    files: [`**/*.{${tsExtensions}}`],
    rules: {
      // Emulates TSC https://typescript-eslint.io/rules/no-unused-vars/#benefits-over-typescript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
  {
    // import-x rules
    files: [`**/*.{${tsExtensions}}`],
    rules: {
      'import-x/first': 'error',
    },
  },
  {
    // eslint-plugin-unicorn rules
    files: [`**/*.{${tsExtensions}}`],
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/consistent-destructuring': 'error',
    },
  },
  {
    // eslint-plugin-promise rules
    files: [`**/*.{${tsExtensions}}`],
    rules: {
      'promise/prefer-await-to-callbacks': 'error',
      'promise/prefer-await-to-then': 'error',
    },
  },
  {
    files: [`**/*.spec.{${tsExtensions}}`],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'unicorn/no-useless-undefined': 'off',
      'vitest/require-top-level-describe': 'error',
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/no-alias-methods': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-standalone-expect': 'error',
      'vitest/prefer-comparison-matcher': 'error',
      'vitest/prefer-each': 'error',
      'vitest/prefer-expect-resolves': 'error',
      'vitest/prefer-hooks-in-order': 'error',
      'vitest/prefer-hooks-on-top': 'error',
      'vitest/prefer-lowercase-title': [
        'error',
        {
          ignore: ['describe'],
        },
      ],
      'vitest/prefer-mock-promise-shorthand': 'error',
      'vitest/prefer-vi-mocked': 'error',
    },
  },
  {
    ...eslintPluginPrettierRecommended,
    files: [`**/*.{${tsExtensions}}`],
  },
];
