// @ts-check
/** @typedef {import('vite').UserConfig} UserConfig */
/** @typedef {import('rollup').ExternalOption} ExternalOption */

import { defineConfig } from 'vite'

/**
 * @param {UserConfig} [config]
 */
export function createViteConfig(config) {
  return defineConfig({
    ...config,
    build: {
      target: 'es2018',
      minify: false,
      emptyOutDir: false,
      ...config?.build,
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs'],
        fileName: 'index',
        ...config?.build?.lib,
      },
      rollupOptions: {
        ...config?.build?.rollupOptions,
        external: mergeExternalOption([/^@codemirror/], config?.build?.rollupOptions?.external),
      },
    },
  })
}

/**
 * @param {(string | RegExp)[]} target
 * @param {ExternalOption} [source]
 * @returns {ExternalOption} Merged {@link ExternalOption}
 */
function mergeExternalOption(target, source) {
  if (Array.isArray(source)) {
    return target.concat(source)
  }
  return source ?? target
}
