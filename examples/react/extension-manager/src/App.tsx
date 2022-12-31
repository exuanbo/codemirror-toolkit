import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { addExtension, extensionManager, removeExtension } from '@codemirror-toolkit/extensions'
import { createCodeMirror } from '@codemirror-toolkit/react'
import { useState } from 'react'

const readOnlyExtension = EditorState.readOnly.of(true)
const readOnlyThemeExtension = EditorView.theme({
  '.cm-line': {
    color: 'gray',
  },
})

const { getView, useViewEffect, useContainerRef } = createCodeMirror<HTMLDivElement>(lastState => ({
  doc: lastState?.doc ?? 'Hello World!',
  extensions: [
    EditorView.theme({
      '&.cm-editor': {
        border: '1px solid gray',
      },
    }),
    extensionManager(readOnlyExtension, readOnlyThemeExtension),
  ],
}))

function Editor() {
  const [readOnly, setReadOnly] = useState(false)
  useViewEffect(view => {
    setReadOnly(view.state.readOnly)
  }, [])
  const toggleReadOnly = () => {
    const view = getView()
    if (view) {
      const addOrRemove = readOnly ? removeExtension : addExtension
      addOrRemove(view, [readOnlyExtension, readOnlyThemeExtension], { flattenDepth: 1 })
      setReadOnly(!readOnly)
    }
  }
  const containerRef = useContainerRef()
  return (
    <>
      <button onClick={toggleReadOnly}>Turn {readOnly ? 'off' : 'on'} read-only</button>
      <div style={{ marginTop: '0.5rem' }} ref={containerRef} />
    </>
  )
}

function App() {
  return <Editor />
}

export default App
