import { createViteConfig } from '@codemirror-toolkit/config/vite.js'

export default createViteConfig({
  build: {
    rollupOptions: {
      external: [/^react/, /^use-sync-external-store/],
    },
  },
})
