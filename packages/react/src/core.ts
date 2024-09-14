import type { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import type { CodeMirror, CodeMirrorConfig, ViewContainer } from './types'
import { createScheduler } from './utils/scheduler'
import { createSubject } from './utils/subject'

export function createCodeMirror(initialConfig?: CodeMirrorConfig): CodeMirror {
  const config$ = createSubject<CodeMirrorConfig | undefined>(initialConfig)

  function getViewConfig(prevState: EditorState | undefined) {
    const config = config$.value
    return typeof config === 'function' ? config(prevState) : { ...config }
  }

  const view$ = createSubject<EditorView | null>(null)
  const container$ = createSubject<ViewContainer | null>(null)

  function createView(container: ViewContainer) {
    const prevState = view$.value?.state
    return new EditorView({
      ...getViewConfig(prevState),
      parent: container,
    })
  }

  const scheduler = createScheduler()

  container$.subscribe((container) => {
    scheduler.request(() => {
      view$.value?.destroy()
      view$.next(container && createView(container))
    })
  })

  config$.subscribe(() => {
    if (scheduler.idle()) {
      scheduler.request(() => {
        const container = container$.value
        if (container) {
          view$.value?.destroy()
          view$.next(createView(container))
        }
      })
    }
  })

  return {
    getView: view$.getValue,
    subscribe: view$.subscribe,
    setContainer: container$.next,
    setConfig: config$.next,
  }
}
