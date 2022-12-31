// @ts-check
/** @typedef {import('prettier').Config} Config */

const { standardOptions } = require('@codemirror-toolkit/config/prettier.cjs')

/** @type {Config} */
const config = {
  ...standardOptions,
  printWidth: 100,
  trailingComma: 'all',
}

module.exports = config
