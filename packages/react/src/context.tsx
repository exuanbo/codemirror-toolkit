import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

import { createCodeMirror } from './create.js'
import type {
  CodeMirror,
  ProvidedCodeMirrorConfig,
  UseContainerRefHook,
  UseViewDispatchHook,
  UseViewEffectHook,
  UseViewHook,
} from './types.js'
import { toPascalCase } from './utils/toPascalCase.js'
import { useSingleton } from './utils/useSingleton.js'

export interface CodeMirrorProviderProps {
  config?: ProvidedCodeMirrorConfig
  children: ReactNode
}

export interface CodeMirrorProvider {
  (props: CodeMirrorProviderProps): JSX.Element
  displayName?: string
}

export type UseCodeMirrorContextHook<ContainerElement extends Element = Element> =
  () => CodeMirror<ContainerElement>

export interface CodeMirrorWithContext<ContainerElement extends Element = Element> {
  Provider: CodeMirrorProvider
  useContext: UseCodeMirrorContextHook<ContainerElement>
  useView: UseViewHook
  useViewEffect: UseViewEffectHook
  useViewDispatch: UseViewDispatchHook
  useContainerRef: UseContainerRefHook<ContainerElement>
}

export function createCodeMirrorWithContext<ContainerElement extends Element>(
  displayName?: string | false,
): CodeMirrorWithContext<ContainerElement> {
  const InternalCodeMirrorContext = createContext<CodeMirror<ContainerElement> | null>(null)

  const CodeMirrorProvider: CodeMirrorProvider = ({ config, children }) => {
    const contextValue = useSingleton(() => createCodeMirror<ContainerElement>(config))
    return (
      <InternalCodeMirrorContext.Provider value={contextValue}>
        {children}
      </InternalCodeMirrorContext.Provider>
    )
  }

  if (displayName) {
    displayName = toPascalCase(displayName)
    CodeMirrorProvider.displayName = `${displayName}.Provider`
    InternalCodeMirrorContext.displayName = `Internal${displayName}`
  }

  const useCodeMirrorContext: UseCodeMirrorContextHook<ContainerElement> = () => {
    const contextValue = useContext(InternalCodeMirrorContext)
    if (!contextValue) {
      throw new Error(
        'could not find CodeMirrorContext value; please ensure the component is wrapped in a <Provider>',
      )
    }
    return contextValue
  }

  const useView: UseViewHook = () => {
    const { useView: useContextView } = useCodeMirrorContext()
    return useContextView()
  }

  const useViewEffect: UseViewEffectHook = (effect, deps) => {
    const { useViewEffect: useContextViewEffect } = useCodeMirrorContext()
    return useContextViewEffect(effect, deps)
  }

  const useViewDispatch: UseViewDispatchHook = (onViewNotReady) => {
    const { useViewDispatch: useContextViewDispatch } = useCodeMirrorContext()
    return useContextViewDispatch(onViewNotReady)
  }

  const useContainerRef: UseContainerRefHook<ContainerElement> = () => {
    const { useContainerRef: useContextContainerRef } = useCodeMirrorContext()
    return useContextContainerRef()
  }

  return {
    Provider: CodeMirrorProvider,
    useContext: useCodeMirrorContext,
    useView,
    useViewEffect,
    useViewDispatch,
    useContainerRef,
  }
}
