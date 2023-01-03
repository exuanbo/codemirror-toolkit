import './App.css'

import { EditorState, Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { createCodeMirrorWithContext } from '@codemirror-toolkit/react'
import { useRef, useState } from 'react'

const defaultThemeExtension = EditorView.theme({
  '&.cm-editor': {
    border: '1px solid gray',
  },
})

const readOnlyExtension = EditorState.readOnly.of(true)
const nonEditableExtension = EditorView.editable.of(false)

const { Provider: CodeMirrorProvider, useContainerRef } =
  createCodeMirrorWithContext<HTMLDivElement>('CodeMirrorContext')

function Editor() {
  const containerRef = useContainerRef()
  return <div ref={containerRef} id="cm-container" />
}

function App() {
  const [shouldShowEditor, setShowEditor] = useState(false)
  const [isReadOnly, setReadOnly] = useState(false)
  const [isEditable, setEditable] = useState(true)
  const extensionSetRef = useRef(new Set<Extension>())
  const handleReadOnlyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked
    const extensionSet = extensionSetRef.current
    extensionSet[isChecked ? 'add' : 'delete'](readOnlyExtension)
    setReadOnly(isChecked)
  }
  const handleEditableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked
    const extensionSet = extensionSetRef.current
    extensionSet[isChecked ? 'delete' : 'add'](nonEditableExtension)
    setEditable(isChecked)
  }
  return (
    <CodeMirrorProvider
      config={prevState => {
        const extensionSet = extensionSetRef.current
        return {
          doc: prevState?.doc ?? 'Hello World!',
          extensions: [defaultThemeExtension, ...extensionSet],
        }
      }}>
      {shouldShowEditor ? (
        <>
          <Editor />
          <button onClick={() => setShowEditor(false)}>Destroy Editor</button>
        </>
      ) : (
        <>
          <label>
            <input checked={isReadOnly} type="checkbox" onChange={handleReadOnlyChange} />
            Read only
          </label>
          <br />
          <label>
            <input checked={isEditable} type="checkbox" onChange={handleEditableChange} />
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
