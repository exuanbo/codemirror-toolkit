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

// prettier-ignore
const { getView, useViewEffect, useContainerRef } = createCodeMirror<HTMLDivElement>((prevState) => ({
  doc: prevState?.doc ?? 'Hello World!',
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
  const [isReadOnly, setReadOnly] = useState(false)
  useViewEffect((view) => {
    setReadOnly(view.state.readOnly)
  })
  const toggleReadOnly = () => {
    const view = getView()
    if (view) {
      const toggleExtension = isReadOnly ? removeExtension : addExtension
      toggleExtension(view, [readOnlyExtension, readOnlyThemeExtension], { flattenDepth: 1 })
      setReadOnly(!isReadOnly)
    }
  }
  const containerRef = useContainerRef()
  return (
    <>
      <button onClick={toggleReadOnly}>Turn {isReadOnly ? 'off' : 'on'} read-only</button>
      <div ref={containerRef} style={{ marginTop: '0.5rem' }} />
    </>
  )
}

function App() {
  return <Editor />
}

export default App
