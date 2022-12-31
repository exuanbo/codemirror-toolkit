// @ts-check
/** @typedef {import('eslint').Linter.Config} Config */

/** @type {Config} */
const config = {
  extends: ['./packages/config/eslint.cjs'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              '{}': false,
            },
            extendDefaults: true,
          },
        ],
        '@typescript-eslint/no-empty-interface': [
          'error',
          {
            allowSingleExtends: true,
          },
        ],
        '@typescript-eslint/no-unused-vars': 'off',
        'react/jsx-sort-props': [
          'error',
          {
            callbacksLast: true,
            shorthandFirst: true,
            multiline: 'last',
            reservedFirst: true,
          },
        ],
        'react/prop-types': 'off',
      },
    },
  ],
}

module.exports = config
