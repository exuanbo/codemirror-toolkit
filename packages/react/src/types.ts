import type { EditorState } from '@codemirror/state'
import type { EditorView, EditorViewConfig } from '@codemirror/view'
import type { EffectCallback } from 'react'

export type EditorViewConfigCreator = (prevState: EditorState | undefined) => EditorViewConfig
export type CodeMirrorConfig = EditorViewConfig | EditorViewConfigCreator

export type ViewChangeHandler = (view: EditorView | null) => void

export type ViewContainer = Element | DocumentFragment

export interface CodeMirror {
  getView: () => EditorView | null
  subscribe: (onViewChange: ViewChangeHandler) => () => void
  setContainer: (container: ViewContainer | null) => void
  setConfig: (config: CodeMirrorConfig) => void
}

export type ViewEffectCleanup = ReturnType<EffectCallback>
export type ViewEffectSetup = (view: EditorView) => ViewEffectCleanup

export interface CodeMirrorHooks {
  useView: () => EditorView | null
  useViewEffect: (setup: ViewEffectSetup) => void
}

export type CodeMirrorWithHooks = CodeMirror & CodeMirrorHooks
