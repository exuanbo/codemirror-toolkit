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

export type UseCodeMirrorContextHook<ContainerElement extends Element = Element> =
  () => CodeMirror<ContainerElement>

export type UseGetViewHook = () => GetView

export interface CodeMirrorWithContext<ContainerElement extends Element = Element> {
  Provider: CodeMirrorProvider
  useContext: UseCodeMirrorContextHook<ContainerElement>
  useGetView: UseGetViewHook
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
    const instance = useSingleton(() => createCodeMirror<ContainerElement>(config))
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

  const useCodeMirrorContext: UseCodeMirrorContextHook<ContainerElement> = () => {
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

  const useContainerRef: UseContainerRefHook<ContainerElement> = () => {
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
