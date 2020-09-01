module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'eslint-config-alloy/react',
    'eslint-config-alloy/typescript',
  ],
  plugins: [
    'react-hooks',
  ],
  globals: {},
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    indent: [
      'error',
      2,
    ],
    '@typescript-eslint/indent': 'off',
    'react/jsx-indent-props': [
      'error',
      2,
    ],
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/typedef': 'off',
    '@typescript-eslint/semi': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'react/jsx-indent': [
      'error',
      2,
    ],
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'eol-last': 2,
    quotes: [2, 'single'],
    'jsx-quotes': ['error', 'prefer-double'],
    'complexity': 'off',
  },
};
