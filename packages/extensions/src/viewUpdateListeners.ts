import type { Extension } from '@codemirror/state'
import { StateEffect, StateField } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import type { SetContainer } from '@codemirror-toolkit/utils'
import { createSetContainer, mapStateEffectValue } from '@codemirror-toolkit/utils'

export type ViewUpdateListener = (update: ViewUpdate) => void

export interface ViewUpdateListenerAction {
  add?: ViewUpdateListener[]
  remove?: ViewUpdateListener[]
  removeAll?: boolean
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
              ({
                add: listenersToAdd = [],
                remove: listenersToRemove = [],
                removeAll: shouldRemoveAllListeners = false,
              }) => {
                const remainingListeners = shouldRemoveAllListeners
                  ? resultListeners.clear()
                  : resultListeners
                return remainingListeners.deleteMany(listenersToRemove).addMany(listenersToAdd)
              },
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

function assertViewUpdateListenersField(view: EditorView): void {
  if (!view.state.field(viewUpdateListenersField, /* require: */ false)) {
    throw new Error('viewUpdateListeners extension is not enabled')
  }
}

export type Unsubscribe = () => void

export function addViewUpdateListener(view: EditorView, listener: ViewUpdateListener): Unsubscribe {
  assertViewUpdateListenersField(view)
  view.dispatch({
    effects: ViewUpdateListenerEffect.of({ add: [listener] }),
  })
  return () => {
    removeViewUpdateListener(view, listener)
  }
}

export function removeViewUpdateListener(view: EditorView, listener: ViewUpdateListener): void {
  assertViewUpdateListenersField(view)
  view.dispatch({
    effects: ViewUpdateListenerEffect.of({ remove: [listener] }),
  })
}

export function removeAllViewUpdateListeners(view: EditorView): void {
  assertViewUpdateListenersField(view)
  view.dispatch({
    effects: ViewUpdateListenerEffect.of({ removeAll: true }),
  })
}
