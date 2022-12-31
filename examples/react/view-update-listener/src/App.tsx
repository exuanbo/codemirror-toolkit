import './App.css'

import { EditorView } from '@codemirror/view'
import { addViewUpdateListener, viewUpdateListeners } from '@codemirror-toolkit/extensions'
import { createCodeMirror } from '@codemirror-toolkit/react'
import { useState } from 'react'

const { useViewEffect, useContainerRef } = createCodeMirror<HTMLDivElement>(prevState => ({
  doc: prevState?.doc ?? 'Hello World!',
  extensions: [
    EditorView.theme({
      '&.cm-editor': {
        border: '1px solid gray',
      },
    }),
    viewUpdateListeners(),
  ],
}))

function Editor() {
  const [letterCount, setLetterCount] = useState<number>()
  useViewEffect(view => {
    setLetterCount(view.state.doc.length)
    return addViewUpdateListener(view, update => {
      if (update.docChanged) {
        setLetterCount(update.state.doc.length)
      }
    })
  }, [])
  const containerRef = useContainerRef()
  return (
    <>
      <div id="cm-container" ref={containerRef} />
      {letterCount != null && <div id="letter-count">Letter Count: {letterCount}</div>}
    </>
  )
}

function App() {
  const [showEditor, setShowEditor] = useState(true)
  return (
    <>
      <button onClick={() => setShowEditor(!showEditor)}>
        {showEditor ? 'Destroy' : 'Create'} Editor
      </button>
      {showEditor && <Editor />}
    </>
  )
}

export default App
