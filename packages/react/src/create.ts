import type { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useCallback, useDebugValue, useEffect } from 'react'
import { unstable_batchedUpdates as batch } from 'react-dom'
import { useSyncExternalStore } from 'use-sync-external-store/shim'

import type {
  CodeMirror,
  ContainerRef,
  GetView,
  ProvidedCodeMirrorConfig,
  UseContainerRefHook,
  UseViewDispatchHook,
  UseViewEffectHook,
  UseViewHook,
} from './types.js'
import { createAsyncScheduler } from './utils/asyncScheduler.js'
import { isFunction } from './utils/isFunction.js'
import { useSingleton } from './utils/useSingleton.js'
import { useSyncedRef } from './utils/useSyncedRef.js'

export function createCodeMirror<ContainerElement extends Element = Element>(
  config?: ProvidedCodeMirrorConfig,
): CodeMirror<ContainerElement> {
  let prevState: EditorState | undefined
  let currentView: EditorView | undefined

  function createConfig() {
    return (isFunction(config) ? config : () => config)(prevState)
  }

  function createView(container: ContainerElement) {
    return new EditorView({
      ...createConfig(),
      parent: container,
    })
  }

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
    if (view === currentView) {
      return
    }
    if (currentView) {
      prevState = currentView.state
      currentView.destroy()
    }
    currentView = view
    publishViewUpdate()
  }

  const getView: GetView = () => currentView

  // EditorView will never be created on the server
  const getServerView: GetView = () => undefined

  const useView: UseViewHook = () => {
    const view = useSyncExternalStore(subscribeViewUpdate, getView, getServerView)
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

  const useViewDispatch: UseViewDispatchHook = onViewNotReady => {
    const viewNotReadyHandlerRef = useSyncedRef(onViewNotReady)
    return useCallback(
      (...specs) => {
        const view = getView()
        if (!view) {
          const fn = viewNotReadyHandlerRef.current
          return fn?.(...specs)
        }
        view.dispatch(...specs)
      },
      [viewNotReadyHandlerRef],
    )
  }

  let containerRef: ContainerRef<ContainerElement> | undefined

  function createContainerRef(): ContainerRef<ContainerElement> {
    let currentContainer: ContainerElement | null = null
    const asyncScheduler = createAsyncScheduler()
    return {
      get current() {
        return currentContainer
      },
      set current(container) {
        if (container === currentContainer) {
          return
        }
        currentContainer = container
        asyncScheduler.cancel()
        asyncScheduler.request(() =>
          batch(() => {
            setView(undefined)
            if (container) {
              setView(createView(container))
            }
          }),
        )
      },
    }
  }

  function getContainerRef() {
    return containerRef ?? (containerRef = createContainerRef())
  }

  const useContainerRef: UseContainerRefHook<ContainerElement> = () => useSingleton(getContainerRef)

  return {
    getView,
    useView,
    useViewEffect,
    useViewDispatch,
    useContainerRef,
  }
}
