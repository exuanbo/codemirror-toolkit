import type { FunctionComponent, PropsWithChildren } from 'react'
import { createContext, createElement, useContext } from 'react'

import { createCodeMirror } from './create.js'
import type {
  CodeMirror,
  GetView,
  ProvidedCodeMirrorConfig,
  UseContainerRefHook,
  UseViewDispatchHook,
  UseViewEffectHook,
  UseViewHook,
} from './types.js'
import { toPascalCase } from './utils/toPascalCase.js'
import { useSingleton } from './utils/useSingleton.js'

export interface CodeMirrorProps {
  config?: ProvidedCodeMirrorConfig
}

export interface CodeMirrorProviderProps extends PropsWithChildren<CodeMirrorProps> {}

export interface CodeMirrorProvider extends FunctionComponent<CodeMirrorProviderProps> {}

export type UseContextHook<Container extends Element = Element> = () => CodeMirror<Container>

export type UseGetViewHook = () => GetView

export interface CodeMirrorWithContext<Container extends Element = Element> {
  Provider: CodeMirrorProvider
  useContext: UseContextHook<Container>
  useGetView: UseGetViewHook
  useView: UseViewHook
  useViewEffect: UseViewEffectHook
  useViewDispatch: UseViewDispatchHook
  useContainerRef: UseContainerRefHook<Container>
}

export function createCodeMirrorWithContext<Container extends Element>(
  displayName?: string | false,
): CodeMirrorWithContext<Container> {
  const InternalCodeMirrorContext = createContext<CodeMirror<Container> | null>(null)

  const CodeMirrorProvider: CodeMirrorProvider = ({ config, children }) => {
    const instance = useSingleton(() => createCodeMirror<Container>(config))
    return /*#__PURE__*/ createElement(
      InternalCodeMirrorContext.Provider,
      { value: instance },
      children,
    )
  }

  if (displayName) {
    displayName = toPascalCase(displayName)
    CodeMirrorProvider.displayName = `${displayName}.Provider`
    InternalCodeMirrorContext.displayName = `Internal${displayName}`
  }

  const useCodeMirrorContext: UseContextHook<Container> = () => {
    const instance = useContext(InternalCodeMirrorContext)
    if (!instance) {
      throw new Error(
        'could not find instance from CodeMirrorContext; please ensure the component is wrapped in a <Provider>',
      )
    }
    return instance
  }

  const useGetView: UseGetViewHook = () => {
    const { getView: getContextView } = useCodeMirrorContext()
    return getContextView
  }

  const useView: UseViewHook = () => {
    const { useView: useContextView } = useCodeMirrorContext()
    return useContextView()
  }

  const useViewEffect: UseViewEffectHook = (setup) => {
    const { useViewEffect: useContextViewEffect } = useCodeMirrorContext()
    return useContextViewEffect(setup)
  }

  const useViewDispatch: UseViewDispatchHook = () => {
    const { useViewDispatch: useContextViewDispatch } = useCodeMirrorContext()
    return useContextViewDispatch()
  }

  const useContainerRef: UseContainerRefHook<Container> = () => {
    const { useContainerRef: useContextContainerRef } = useCodeMirrorContext()
    return useContextContainerRef()
  }

  return {
    Provider: CodeMirrorProvider,
    useContext: useCodeMirrorContext,
    useGetView,
    useView,
    useViewEffect,
    useViewDispatch,
    useContainerRef,
  }
}
