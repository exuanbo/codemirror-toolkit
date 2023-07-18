import type { Extension } from '@codemirror/state'
import { StateEffect, StateField } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import { isEffectOfType, mapEffectValue } from '@codemirror-toolkit/utils'

export type UpdateListener = (update: ViewUpdate) => void

export interface UpdateListenerAction {
  add?: UpdateListener[]
  remove?: UpdateListener[]
}

export const UpdateListenerEffect = /*#__PURE__*/ StateEffect.define<UpdateListenerAction>()

type UpdateListenerSet = Set<UpdateListener>

const updateListenerField = /*#__PURE__*/ StateField.define<UpdateListenerSet>({
  create() {
    return new Set()
  },
  update(listeners, transaction) {
    transaction.effects.filter(isEffectOfType(UpdateListenerEffect)).forEach(
      mapEffectValue((action) => {
        action.add?.forEach((listener) => listeners.add(listener))
        action.remove?.forEach((listener) => listeners.delete(listener))
      }),
    )
    return listeners
  },
  provide(thisField) {
    return EditorView.updateListener.from(
      thisField,
      (listeners) =>
        function aggregatedListener(update) {
          listeners.forEach((listener) => listener(update))
        },
    )
  },
})

export function updateListener(...initialListeners: UpdateListener[]): Extension {
  return updateListenerField.init(() => new Set(initialListeners))
}

function assertUpdateListenerField(view: EditorView): void {
  if (!view.state.field(updateListenerField, /* require: */ false)) {
    throw new Error('updateListener extension is not enabled')
  }
}

export type Unsubscribe = () => void

export function addUpdateListener(view: EditorView, listener: UpdateListener): Unsubscribe {
  assertUpdateListenerField(view)
  view.dispatch({
    effects: UpdateListenerEffect.of({ add: [listener] }),
  })
  return () => {
    removeUpdateListener(view, listener)
  }
}

export function removeUpdateListener(view: EditorView, listener: UpdateListener): void {
  assertUpdateListenerField(view)
  view.dispatch({
    effects: UpdateListenerEffect.of({ remove: [listener] }),
  })
}
