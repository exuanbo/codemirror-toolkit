import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { addExtension, extensionManager, removeExtension } from '@codemirror-toolkit/extensions'
import { create, ViewEffectSetup } from '@codemirror-toolkit/react'
import { useCallback, useState } from 'react'

const readOnlyExtension = EditorState.readOnly.of(true)
const readOnlyThemeExtension = EditorView.theme({
  '.cm-line': {
    color: 'gray',
  },
})

const { getView, useViewEffect, setContainer } = create((prevState) => ({
  state: prevState,
  doc: 'Hello World!',
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
  const syncReadOnly = useCallback<ViewEffectSetup>((view) => {
    setReadOnly(view.state.readOnly)
  }, [])
  useViewEffect(syncReadOnly)
  const toggleReadOnly = () => {
    const view = getView()
    if (view) {
      const toggleExtension = isReadOnly ? removeExtension : addExtension
      toggleExtension(view, [readOnlyExtension, readOnlyThemeExtension], { flattenDepth: 1 })
      setReadOnly(!isReadOnly)
    }
  }
  return (
    <>
      <button onClick={toggleReadOnly}>Turn {isReadOnly ? 'off' : 'on'} read-only</button>
      <div ref={setContainer} style={{ marginTop: '0.5rem' }} />
    </>
  )
}

function App() {
  return <Editor />
}

export default App
