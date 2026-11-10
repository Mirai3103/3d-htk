import globals from 'globals';

// Lint is mainly a safety net for the module split: it catches identifiers
// that are used but never imported (no-undef) and writes to imported bindings.
export default [
  { ignores: ['dist/**', 'node_modules/**', 'vite-project-template/**'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      'no-undef': 'error',
      'no-import-assign': 'error',
      'no-const-assign': 'error',
      'no-redeclare': 'error',
      'no-unused-vars': ['warn', { args: 'none' }],
    },
  },
];
