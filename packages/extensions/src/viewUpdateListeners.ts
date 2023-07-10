import type { Extension } from '@codemirror/state'
import { StateEffect, StateField } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import { ImmutableSetUtils, mapStateEffectValue } from '@codemirror-toolkit/utils'

export type ViewUpdateListener = (update: ViewUpdate) => void

export interface ViewUpdateListenerAction {
  add?: ViewUpdateListener[]
  remove?: ViewUpdateListener[]
}

export const ViewUpdateListenerEffect = /*#__PURE__*/ StateEffect.define<ViewUpdateListenerAction>()

type ViewUpdateListenerSet = Set<ViewUpdateListener>

const viewUpdateListenersField = /*#__PURE__*/ StateField.define<ViewUpdateListenerSet>({
  create() {
    return new Set()
  },
  update(listeners, transaction) {
    return transaction.effects.reduce(
      (resultListeners, effect) =>
        effect.is(ViewUpdateListenerEffect)
          ? mapStateEffectValue(effect, (action) =>
              ImmutableSetUtils.wrap(resultListeners)
                .addMany(action.add ?? [])
                .deleteMany(action.remove ?? [])
                .unwrap(),
            )
          : resultListeners,
      listeners,
    )
  },
  provide(thisField) {
    return EditorView.updateListener.compute([thisField], (state) => {
      const listenerSet = state.field(thisField)
      return (update) => {
        listenerSet.forEach((listener) => listener(update))
      }
    })
  },
})

export function viewUpdateListeners(...initialListeners: ViewUpdateListener[]): Extension {
  return viewUpdateListenersField.init(() => new Set(initialListeners))
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
