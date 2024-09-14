import { EditorView } from '@codemirror/view'
import { useEffect } from 'react'

import type { CodeMirror, ViewEffectCleanup, ViewEffectSetup } from '../types'

export function defineViewEffect(setup: ViewEffectSetup) {
  return setup
}

export function useViewEffect(cm: CodeMirror, setup: ViewEffectSetup): void

export function useViewEffect({ subscribe }: CodeMirror, setup: ViewEffectSetup) {
  useEffect(() => {
    function setupEffect(view: EditorView | null) {
      return view && setup(view)
    }
    let cleanup: ViewEffectCleanup | null
    const unsubscribe = subscribe((view) => {
      cleanup?.()
      cleanup = setupEffect(view)
    })
    return () => {
      unsubscribe()
      cleanup?.()
    }
  }, [setup, subscribe])
}
