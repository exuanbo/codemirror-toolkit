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
import { isFunction } from './utils/isFunction.js'
import { createRafScheduler } from './utils/rafScheduler.js'
import { useSyncedRef } from './utils/useSyncedRef.js'

export function createCodeMirror<ContainerElement extends Element>(
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

  type ViewChangeCallback = () => void
  const viewChangeCallbacks = new Set<ViewChangeCallback>()

  function subscribeViewChange(callback: ViewChangeCallback) {
    viewChangeCallbacks.add(callback)
    return () => viewChangeCallbacks.delete(callback)
  }

  function publishViewChange() {
    viewChangeCallbacks.forEach((callback) => callback())
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
    publishViewChange()
  }

  const getView: GetView = () => currentView

  // EditorView will never be created on the server
  const getServerView: GetView = () => undefined

  const useView: UseViewHook = () => {
    const view = useSyncExternalStore(subscribeViewChange, getView, getServerView)
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

  const useViewDispatch: UseViewDispatchHook = (onViewNotReady) => {
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
    const rafScheduler = createRafScheduler()
    let currentContainer: ContainerElement | null = null
    return Object.seal({
      get current() {
        return currentContainer
      },
      set current(container) {
        if (container === currentContainer) {
          return
        }
        currentContainer = container
        rafScheduler.cancel()
        rafScheduler.request(() =>
          batch(() => {
            setView(undefined)
            if (container) {
              setView(createView(container))
            }
          }),
        )
      },
    })
  }

  const useContainerRef: UseContainerRefHook<ContainerElement> = () => {
    // Reading an external variable on every render breaks the rules of React, and only works
    // because the container ref object will always be the same after creation.
    // `useSyncExternalStore` with a no-op subscription function would achieve the same effect.
    return containerRef ?? (containerRef = createContainerRef())
  }

  return {
    getView,
    useView,
    useViewEffect,
    useViewDispatch,
    useContainerRef,
  }
}
