import type { Extension } from '@codemirror/state'
import { StateEffect, StateField } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import type { SetContainer } from '@codemirror-toolkit/utils'
import { createSetContainer, mapStateEffectValue } from '@codemirror-toolkit/utils'

export type ViewUpdateListener = (update: ViewUpdate) => void

export interface ViewUpdateListenerAction {
  add?: ViewUpdateListener[]
  remove?: ViewUpdateListener[] | 'all'
}

export const ViewUpdateListenerEffect = /*#__PURE__*/ StateEffect.define<ViewUpdateListenerAction>()

type ViewUpdateListenerSetContainer = SetContainer<ViewUpdateListener>

const viewUpdateListenersField = /*#__PURE__*/ StateField.define<ViewUpdateListenerSetContainer>({
  create() {
    return createSetContainer()
  },
  update(listeners, transaction) {
    return transaction.effects.reduce(
      (resultListeners, effect) =>
        effect.is(ViewUpdateListenerEffect)
          ? mapStateEffectValue(
              effect,
              ({ remove: listenersToRemove = [], add: listenersToAdd = [] }) =>
                (listenersToRemove === 'all'
                  ? resultListeners.clear()
                  : resultListeners.deleteMany(listenersToRemove)
                ).addMany(listenersToAdd),
            )
          : resultListeners,
      listeners,
    )
  },
  provide(thisField) {
    return EditorView.updateListener.computeN([thisField], state => {
      const listenerSetContainer = state.field(thisField)
      return [...listenerSetContainer.extract()]
    })
  },
})

export function viewUpdateListeners(...initialListeners: ViewUpdateListener[]): Extension {
  return viewUpdateListenersField.init(() =>
    createSetContainer<ViewUpdateListener>().addMany(initialListeners),
  )
}

function ensureViewUpdateListenersField(view: EditorView): void {
  if (!view.state.field(viewUpdateListenersField, /* require: */ false)) {
    throw new Error('viewUpdateListeners extension is not enabled')
  }
}

export type Unsubscribe = () => void

export function addViewUpdateListener(view: EditorView, listener: ViewUpdateListener): Unsubscribe {
  ensureViewUpdateListenersField(view)
  view.dispatch({
    effects: ViewUpdateListenerEffect.of({ add: [listener] }),
  })
  return () => {
    removeViewUpdateListener(view, listener)
  }
}

export function removeViewUpdateListener(view: EditorView, listener: ViewUpdateListener): void {
  ensureViewUpdateListenersField(view)
  view.dispatch({
    effects: ViewUpdateListenerEffect.of({ remove: [listener] }),
  })
}

export function clearViewUpdateListeners(view: EditorView): void {
  ensureViewUpdateListenersField(view)
  view.dispatch({
    effects: ViewUpdateListenerEffect.of({ remove: 'all' }),
  })
}
