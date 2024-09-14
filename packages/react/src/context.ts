import type { FunctionComponent, PropsWithChildren } from 'react'
import * as React from 'react'
import { createElement, useContext, useRef } from 'react'

import { createCodeMirror } from './core'
import type { CodeMirror, CodeMirrorConfig } from './types'

export interface CodeMirrorProps {
  config?: CodeMirrorConfig
}

export interface CodeMirrorProviderProps extends PropsWithChildren<CodeMirrorProps> {}

export interface CodeMirrorProvider extends FunctionComponent<CodeMirrorProviderProps> {}

export interface CodeMirrorContext {
  Provider: CodeMirrorProvider
  useCodeMirror: () => CodeMirror
}

export function createContext(): CodeMirrorContext {
  const CodeMirrorContext = React.createContext<CodeMirror | null>(null)

  const CodeMirrorProvider: CodeMirrorProvider = ({ config, children }) => {
    const instanceRef = useRef<CodeMirror | null>(null)
    function getInstance() {
      if (!instanceRef.current) {
        instanceRef.current = createCodeMirror(config)
      }
      return instanceRef.current
    }
    return createElement(CodeMirrorContext.Provider, { value: getInstance() }, children)
  }

  function useCodeMirrorContext() {
    const instance = useContext(CodeMirrorContext)
    if (!instance) {
      throw new Error(
        'could not find instance from CodeMirrorContext; please ensure the component is wrapped in a <Provider>',
      )
    }
    return instance
  }

  return {
    Provider: CodeMirrorProvider,
    useCodeMirror: useCodeMirrorContext,
  }
}
