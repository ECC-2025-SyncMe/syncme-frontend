<<<<<<< HEAD
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
=======
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier'; // Prettier 충돌 방지

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
>>>>>>> 8949830da6b6fd531183eb655cdc5df1d9f6b935
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
<<<<<<< HEAD
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
=======
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // --- 가이드라인 권장 커스텀 규칙 추가 ---
      "no-unused-vars": "warn",   // 1. 사용하지 않는 변수 경고 [cite: 47]
      "eqeqeq": "error",         // 2. == 대신 === 사용 강제 [cite: 47]
      "no-console": "warn",      // 3. 콘솔 로그(console.log) 남발 방지 [cite: 43]
    },
  },
  eslintConfigPrettier, // 마지막에 추가하여 Prettier 스타일과 충돌하는 Lint 규칙을 끕니다. [cite: 54]
];
>>>>>>> 8949830da6b6fd531183eb655cdc5df1d9f6b935
