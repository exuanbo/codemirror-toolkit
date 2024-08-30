import type { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useCallback, useDebugValue, useEffect, useSyncExternalStore } from 'react'

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
import { useEffectEvent } from './utils/useEffectEventShim.js'

export function createCodeMirror<ContainerElement extends Element>(
  config?: ProvidedCodeMirrorConfig,
): CodeMirror<ContainerElement> {
  let prevState: EditorState | undefined
  let currentView: EditorView | null = null

  function createConfig() {
    return (typeof config === 'function' ? config : () => config)(prevState)
  }

  function createView(container: ContainerElement) {
    return new EditorView({
      ...createConfig(),
      parent: container,
    })
  }

  type ViewChangeCallback = () => void
  const viewChangeCallbacks = new Set<ViewChangeCallback>()

  type UnsubscribeViewChange = () => void
  function subscribeViewChange(callback: ViewChangeCallback): UnsubscribeViewChange {
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

  /* v8 ignore next */
  const getServerView: GetView = () => null

  const useView: UseViewHook = () => {
    const view = useSyncExternalStore(subscribeViewChange, getView, getServerView)
    useDebugValue(view)
    return view
  }

  const useViewEffect: UseViewEffectHook = (setup) => {
    const setupEvent = useEffectEvent((view: EditorView | null) => view && setup(view))
    useEffect(() => {
      let cleanup = setupEvent(getView())
      const unsubscribe = subscribeViewChange(() => {
        cleanup?.()
        cleanup = setupEvent(getView())
      })
      return () => {
        unsubscribe()
        cleanup?.()
      }
    }, [setupEvent])
  }

  const useViewDispatch: UseViewDispatchHook = () =>
    useCallback((...transactions) => {
      const view = getView()
      if (!view) {
        throw new ReferenceError('dispatch called before view is initialized')
      }
      // @ts-expect-error: overloaded signature
      view.dispatch(...transactions)
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
        scheduler.request(() => {
          setView(null)
          setView(container && createView(container))
        })
      },
    })
  }

  let currentContainerRef: ContainerRef<ContainerElement> | undefined

  function getContainerRef() {
    return currentContainerRef ?? (currentContainerRef = createContainerRef())
  }

  const useContainerRef: UseContainerRefHook<ContainerElement> = () => {
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
