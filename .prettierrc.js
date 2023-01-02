// @ts-check
/** @typedef {import('prettier').Config} Config */

const { standardOptions } = require('@codemirror-toolkit/config/prettier')

/** @type {Config} */
const config = {
  ...standardOptions,
  printWidth: 100,
  trailingComma: 'all',
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 80,
      },
    },
  ],
}

module.exports = config
