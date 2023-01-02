import type { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useCallback, useDebugValue, useEffect } from 'react'
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
import { createCallbackScheduler } from './utils/callbackScheduler.js'
import { isFunction } from './utils/isFunction.js'
import { useSingleton } from './utils/useSingleton.js'

export function createCodeMirror<ContainerElement extends Element = Element>(
  config?: ProvidedCodeMirrorConfig,
): CodeMirror<ContainerElement> {
  const createConfig = isFunction(config) ? config : () => config

  let prevState: EditorState | undefined
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

  const useView: UseViewHook = () => {
    const view = useSyncExternalStore(
      subscribeViewUpdate,
      getView,
      // EditorView will never be created on the server
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

  const useViewDispatch: UseViewDispatchHook = () =>
    useCallback((...args) => {
      const view = getView()
      view?.dispatch(...args)
    }, [])

  const createContainerRef = (): ContainerRef<ContainerElement> => {
    let currentContainer: ContainerElement | null = null
    const callbackScheduler = createCallbackScheduler()
    return {
      get current() {
        return currentContainer
      },
      set current(container) {
        if (container === currentContainer) {
          return
        }
        currentContainer = container
        callbackScheduler.cancel()
        callbackScheduler.request(() => {
          setView(undefined)
          if (container) {
            const view = new EditorView({
              ...createConfig(prevState),
              parent: container,
            })
            setView(view)
          }
        })
      },
    }
  }

  let containerRef: ContainerRef<ContainerElement> | undefined
  const getContainerRef = () => containerRef ?? (containerRef = createContainerRef())

  const useContainerRef: UseContainerRefHook<ContainerElement> = () => useSingleton(getContainerRef)

  return {
    getView,
    useView,
    useViewEffect,
    useViewDispatch,
    useContainerRef,
  }
}
