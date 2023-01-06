import type { Extension } from '@codemirror/state'
import { StateEffect, StateField } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import type { SetProxy } from '@codemirror-toolkit/utils'
import { createSetProxy, mapStateEffectValue } from '@codemirror-toolkit/utils'

export type ViewUpdateListener = (update: ViewUpdate) => void

export interface ViewUpdateListenerAction {
  add?: ViewUpdateListener[]
  remove?: ViewUpdateListener[]
  removeAll?: boolean
}

export const ViewUpdateListenerEffect = /*#__PURE__*/ StateEffect.define<ViewUpdateListenerAction>()

type ViewUpdateListenerSetProxy = SetProxy<ViewUpdateListener>

const viewUpdateListenersField = /*#__PURE__*/ StateField.define<ViewUpdateListenerSetProxy>({
  create() {
    return createSetProxy()
  },
  update(listeners, transaction) {
    return transaction.effects.reduce(
      (resultListeners, effect) =>
        effect.is(ViewUpdateListenerEffect)
          ? mapStateEffectValue(effect, (listenerAction) => {
              const remainingListeners = listenerAction.removeAll
                ? resultListeners.clear()
                : resultListeners
              return remainingListeners
                .addMany(listenerAction.add ?? [])
                .deleteMany(listenerAction.remove ?? [])
            })
          : resultListeners,
      listeners,
    )
  },
  provide(thisField) {
    return EditorView.updateListener.computeN([thisField], (state) => {
      const listenerSetProxy = state.field(thisField)
      return [...listenerSetProxy.unwrap()]
    })
  },
})

export function viewUpdateListeners(...initialListeners: ViewUpdateListener[]): Extension {
  return viewUpdateListenersField.init(() =>
    createSetProxy<ViewUpdateListener>().addMany(initialListeners),
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
