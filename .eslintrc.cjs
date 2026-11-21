module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', 'node_modules', 'coverage', '*.cjs', 'tailwind.config.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    // Disabled: this project intentionally exports variants/hooks beside components
    // (shadcn/ui pattern). Fast refresh still works for the component itself.
    'react-refresh/only-export-components': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    eqeqeq: ['error', 'smart'],
  },
  overrides: [
    {
      files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
      env: { node: true },
      rules: { 'no-console': 'off' },
    },
  ],
};
