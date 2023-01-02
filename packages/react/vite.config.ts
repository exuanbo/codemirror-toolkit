import { createViteConfig } from '@codemirror-toolkit/config/vite.mjs'

export default createViteConfig({
  build: {
    rollupOptions: {
      external: [/^react/, /^use-sync-external-store/],
    },
  },
})
