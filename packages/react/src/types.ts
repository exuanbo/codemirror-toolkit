import type { EditorState } from '@codemirror/state'
import type { EditorView, EditorViewConfig } from '@codemirror/view'
import type { DependencyList, EffectCallback, MutableRefObject } from 'react'

export type EditorViewConfigWithoutParentElement = Omit<EditorViewConfig, 'parent'>
export interface CodeMirrorConfig extends EditorViewConfigWithoutParentElement {}

export type CodeMirrorConfigCreator = (prevState: EditorState | undefined) => CodeMirrorConfig
export type ProvidedCodeMirrorConfig = CodeMirrorConfig | CodeMirrorConfigCreator

export type GetView = () => EditorView | null
export type UseViewHook = () => EditorView | null

export type ViewEffectDestructor = ReturnType<EffectCallback>
export type ViewEffectCallback = (view: EditorView) => ViewEffectDestructor
export type UseViewEffectHook = (effect: ViewEffectCallback, deps: DependencyList) => void

export type ViewDispath = typeof EditorView.prototype.dispatch
export type UseViewDispatchHook = () => ViewDispath

export type ContainerRef<ContainerElement extends Element = Element> =
  MutableRefObject<ContainerElement | null>
export type UseContainerRefHook<ContainerElement extends Element = Element> =
  () => ContainerRef<ContainerElement>

export interface CodeMirror<ContainerElement extends Element = Element> {
  getView: GetView
  useView: UseViewHook
  useViewEffect: UseViewEffectHook
  useViewDispatch: UseViewDispatchHook
  useContainerRef: UseContainerRefHook<ContainerElement>
}
