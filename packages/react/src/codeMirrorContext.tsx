import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

import { createCodeMirror } from './codeMirror.js'
import type {
  CodeMirror,
  ProvidedCodeMirrorConfig,
  UseCodeMirrorHook,
  UseContainerRefHook,
  UseViewEffectHook,
  UseViewHook,
} from './types.js'
import { useSingleton } from './utils/useSingleton.js'

export interface CodeMirrorProviderProps {
  config?: ProvidedCodeMirrorConfig
  children: ReactNode
}

export interface CodeMirrorContextProvider {
  (props: CodeMirrorProviderProps): JSX.Element
  displayName?: string
}

export interface CodeMirrorContext<ContainerElement extends Element = Element> {
  Provider: CodeMirrorContextProvider
  useCodeMirror: UseCodeMirrorHook<ContainerElement>
  useView: UseViewHook
  useViewEffect: UseViewEffectHook
  useContainerRef: UseContainerRefHook<ContainerElement>
}

export function createCodeMirrorContext<
  ContainerElement extends Element,
>(): CodeMirrorContext<ContainerElement> {
  const InternalCodeMirrorContext = createContext<CodeMirror<ContainerElement> | null>(null)

  const Provider: CodeMirrorContextProvider = ({ config, children }) => {
    const codeMirror = useSingleton(() => createCodeMirror<ContainerElement>(config))
    return (
      <InternalCodeMirrorContext.Provider value={codeMirror}>
        {children}
      </InternalCodeMirrorContext.Provider>
    )
  }

  const useCodeMirror: UseCodeMirrorHook<ContainerElement> = () => {
    const codeMirror = useContext(InternalCodeMirrorContext)
    if (!codeMirror) {
      throw new Error(
        'could not find CodeMirrorContext value; please ensure the component is wrapped in a <Provider>',
      )
    }
    return codeMirror
  }

  const useView: UseViewHook = () => {
    const { useView } = useCodeMirror()
    return useView()
  }

  const useViewEffect: UseViewEffectHook = (effect, deps) => {
    const { useViewEffect } = useCodeMirror()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useViewEffect(effect, deps)
  }

  const useContainerRef: UseContainerRefHook<ContainerElement> = () => {
    const { useContainerRef } = useCodeMirror()
    return useContainerRef()
  }

  return {
    Provider,
    useCodeMirror,
    useView,
    useViewEffect,
    useContainerRef,
  }
}
