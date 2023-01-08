// @ts-check
/** @typedef {import('vitest/config').UserConfig} UserConfig */
/** @typedef {import('rollup').ExternalOption} ExternalOption */

import { defineConfig } from 'vitest/config'

/**
 * @param {UserConfig} [config]
 */
export function createViteConfig(config) {
  return defineConfig({
    ...config,
    build: {
      target: 'es2018',
      sourcemap: true,
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
    test: {
      globals: true,
      environment: 'jsdom',
      ...config?.test,
      coverage: {
        reporter: ['text', 'lcov'],
        ...config?.test?.coverage,
      },
    },
  })
}

/**
 * @param {(string | RegExp)[]} target
 * @param {ExternalOption} [source]
 */
function mergeExternalOption(target, source) {
  if (Array.isArray(source)) {
    return target.concat(source)
  }
  return source ?? target
}
