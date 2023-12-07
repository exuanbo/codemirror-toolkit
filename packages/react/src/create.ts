import type { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useCallback, useDebugValue, useEffect, useSyncExternalStore } from 'react'
import { unstable_batchedUpdates as batch } from 'react-dom'

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

export function createCodeMirror<ContainerElement extends Element>(
  config?: ProvidedCodeMirrorConfig,
): CodeMirror<ContainerElement> {
  let prevState: EditorState | undefined
  let currentView: EditorView | null = null

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

  function setView(view: EditorView | null) {
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

  const getServerView: GetView = () => null

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

  const useViewDispatch: UseViewDispatchHook = () =>
    useCallback((...specs) => {
      const view = getView()
      if (!view) {
        throw new TypeError('Cannot dispatch transaction without a view')
      }
      // @ts-expect-error: overloaded signature
      view.dispatch(...specs)
    }, [])

  function createContainerRef(): ContainerRef<ContainerElement> {
    let currentContainer: ContainerElement | null = null
    const scheduler = createAsyncScheduler()
    return Object.seal({
      get current() {
        return currentContainer
      },
      set current(container) {
        if (container === currentContainer) {
          return
        }
        currentContainer = container
        scheduler.cancel()
        scheduler.request(() =>
          batch(() => {
            setView(null)
            setView(container && createView(container))
          }),
        )
      },
    })
  }

  let currentContainerRef: ContainerRef<ContainerElement> | undefined

  function getContainerRef() {
    return currentContainerRef ?? (currentContainerRef = createContainerRef())
  }

  const useContainerRef: UseContainerRefHook<ContainerElement> = () => {
    // Reading an external variable on every render breaks the rules of React, and only works here
    // because function `getContainerRef` will always return the same object.
    // Using `useSyncExternalStore` with a no-op subscription function would have the same effect.
    // Check out the shim implementations for pre-18 versions at
    // https://github.com/facebook/react/tree/main/packages/use-sync-external-store/src
    // or find the functions `mountSyncExternalStore` and `updateSyncExternalStore` at
    // https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.js
    // Regardless, if the store never updates, during rendering `useSyncExternalStore` calls the
    // passed function `getSnapshot` and simply returns the result. Any other actions it performs
    // do not affect the outcome, which is the same as reading the variable directly.
    const containerRef = getContainerRef()
    useDebugValue(containerRef)
    return containerRef
  }

  return {
    getView,
    useView,
    useViewEffect,
    useViewDispatch,
    useContainerRef,
  }
}
