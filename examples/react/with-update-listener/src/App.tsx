import './App.css'

import { EditorView } from '@codemirror/view'
import { addUpdateListener, updateListener } from '@codemirror-toolkit/extensions'
import { create, ViewEffectSetup } from '@codemirror-toolkit/react'
import { useCallback, useState } from 'react'

const { useViewEffect, setContainer } = create((prevState) => ({
  state: prevState,
  doc: 'Hello World!',
  extensions: [
    EditorView.theme({
      '&.cm-editor': {
        border: '1px solid gray',
      },
    }),
    updateListener(),
  ],
}))

function Editor() {
  const [letterCount, setLetterCount] = useState<number>()
  const updateLetterCount = useCallback<ViewEffectSetup>((view) => {
    setLetterCount(view.state.doc.length)
    return addUpdateListener(view, (update) => {
      if (update.docChanged) {
        setLetterCount(update.state.doc.length)
      }
    })
  }, [])
  useViewEffect(updateLetterCount)
  return (
    <>
      <div ref={setContainer} id="cm-container" />
      {letterCount != null && <div id="letter-count">Letter Count: {letterCount}</div>}
    </>
  )
}

function App() {
  return <Editor />
}

export default App
