import type { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useDebugValue, useEffect } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'

import type {
  CodeMirror,
  GetView,
  ProvidedCodeMirrorConfig,
  UseContainerRefHook,
  UseViewEffectHook,
  UseViewHook,
} from './types.js'
import { isFunction } from './utils/isFunction.js'
import { useRefWithSyncEffect } from './utils/useRefWithSyncEffect.js'

export function createCodeMirror<ContainerElement extends Element = Element>(
  config?: ProvidedCodeMirrorConfig,
): CodeMirror<ContainerElement> {
  let currentView: EditorView | undefined
  type ViewUpdateCallback = () => void
  const viewUpdateCallbacks = new Set<ViewUpdateCallback>()

  function subscribeViewUpdate(callback: ViewUpdateCallback) {
    viewUpdateCallbacks.add(callback)
    return () => {
      viewUpdateCallbacks.delete(callback)
    }
  }

  function publishViewUpdate() {
    viewUpdateCallbacks.forEach(callback => callback())
  }

  function setView(view: EditorView | undefined) {
    currentView = view
    publishViewUpdate()
  }

  const getView: GetView = () => currentView

  const useView: UseViewHook = () => {
    const view = useSyncExternalStore(
      subscribeViewUpdate,
      getView,
      // `EditorView` will never be created on the server
      () => undefined,
    )
    useDebugValue(view)
    return view
  }

  const useViewEffect: UseViewEffectHook = (effect, deps) => {
    const view = useView()
    useEffect(() => {
      if (view) {
        return effect(view)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, ...deps])
  }

  let prevState: EditorState | undefined
  const createConfig = isFunction(config) ? config : () => config

  const useContainerRef: UseContainerRefHook<ContainerElement> = () =>
    useRefWithSyncEffect<ContainerElement | null>(null, container => {
      if (!container || typeof window === 'undefined') {
        return
      }
      const view = new EditorView({
        ...createConfig(prevState),
        parent: container,
      })
      setView(view)
      return () => {
        prevState = view.state
        view.destroy()
        setView(undefined)
      }
    })

  return {
    getView,
    useView,
    useViewEffect,
    useContainerRef,
  }
}
