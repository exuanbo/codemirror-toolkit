// @ts-check
/** @typedef {import('eslint').Linter.Config} Config */

const defaultConfig = require.resolve('@codemirror-toolkit/config/eslint')

/** @type {Config} */
const config = {
  extends: [defaultConfig],
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
            reservedFirst: true,
          },
        ],
        'react/prop-types': 'off',
        'react-hooks/exhaustive-deps': [
          'warn',
          {
            additionalHooks: '(useViewEffect)',
          },
        ],
      },
    },
  ],
}

module.exports = config
