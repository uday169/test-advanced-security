module.exports = {
  env: { node: true, es2021: true },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-eval': 'warn', // intentionally warning for preserved vulnerable training routes
  },
};
