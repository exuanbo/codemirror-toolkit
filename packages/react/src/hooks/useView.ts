import type { EditorView } from '@codemirror/view'
import { useEffect, useState } from 'react'

import type { CodeMirror } from '../types'

export function useView(cm: CodeMirror): EditorView | null

export function useView({ getView, subscribe }: CodeMirror) {
  const [view, setView] = useState(getView)
  useEffect(() => subscribe(setView), [subscribe])
  return view
}
