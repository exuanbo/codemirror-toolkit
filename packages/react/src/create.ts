import { createCodeMirror } from './core'
import { useView, useViewEffect } from './hooks'
import type { CodeMirrorConfig, CodeMirrorWithHooks } from './types'

export function create(config?: CodeMirrorConfig): CodeMirrorWithHooks {
  const cm = createCodeMirror(config)
  return {
    ...cm,
    useView: () => useView(cm),
    useViewEffect: (setup) => useViewEffect(cm, setup),
  }
}
