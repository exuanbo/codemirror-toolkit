import './App.css'

import { EditorState, Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { createCodeMirrorContext } from '@codemirror-toolkit/react'
import { useInsertionEffect, useRef, useState } from 'react'

const defaultThemeExtension = EditorView.theme({
  '&.cm-editor': {
    border: '1px solid gray',
  },
})

const NULLExtension: Extension = []
const readOnlyExtension = EditorState.readOnly.of(true)
const nonEditableExtension = EditorView.editable.of(false)

const { Provider: CodeMirrorProvider, useContainerRef } = createCodeMirrorContext<HTMLDivElement>()

function Editor() {
  const containerRef = useContainerRef()
  return <div id="cm-container" ref={containerRef} />
}

function App() {
  const [showEditor, setShowEditor] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [editable, setEditable] = useState(true)
  const extensionsRef = useRef(NULLExtension)
  useInsertionEffect(() => {
    extensionsRef.current = [
      readOnly ? readOnlyExtension : NULLExtension,
      editable ? NULLExtension : nonEditableExtension,
    ]
  }, [readOnly, editable])
  return (
    <CodeMirrorProvider
      config={prevState => {
        const extensions = extensionsRef.current
        return {
          doc: prevState?.doc ?? 'Hello World!',
          extensions: [defaultThemeExtension, extensions],
        }
      }}>
      {showEditor ? (
        <>
          <Editor />
          <button onClick={() => setShowEditor(false)}>Destroy Editor</button>
        </>
      ) : (
        <>
          <label>
            <input
              type="checkbox"
              checked={readOnly}
              onChange={event => setReadOnly(event.target.checked)}
            />
            Read only
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={editable}
              onChange={event => setEditable(event.target.checked)}
            />
            Editable
          </label>
          <br />
          <button onClick={() => setShowEditor(true)}>Create Editor</button>
        </>
      )}
    </CodeMirrorProvider>
  )
}

export default App
