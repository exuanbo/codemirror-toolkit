import { createViteConfig } from '@codemirror-toolkit/config/vite.mjs'

export default createViteConfig({
  build: {
    rollupOptions: {
      external: [/^react/, /^use-sync-external-store/],
      output: {
        interop: (id) => (id === 'react' ? 'esModule' : 'default'),
      },
    },
  },
  test: {
    setupFiles: './tests/setup.ts',
  },
})
