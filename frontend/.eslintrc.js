module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'import', 'jsx-a11y'],
  rules: {
    'max-len': 'off',
    'no-bitwise': ['error', { allow: ['~'] }],
    '@typescript-eslint/camelcase': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-no-bind': 'off',
    'react/prop-types': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', 'js'] }],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
