# @codemirror-toolkit/react

[![npm (scoped)](https://img.shields.io/npm/v/@codemirror-toolkit/react.svg)](https://www.npmjs.com/package/@codemirror-toolkit/react)
[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@codemirror-toolkit/react.svg)](https://bundlephobia.com/package/@codemirror-toolkit/react)

A small and flexible solution for binding [CodeMirror 6](https://codemirror.net/) to React.

Instead of providing ready-to-use components with a big amount of props (like [@uiw/react-codemirror](https://github.com/uiwjs/react-codemirror)), it offers a set of hooks and an _optional_ context provider that can be used to better integrate CodeMirror 6 with React.

[Check out the latest README on GitHub](https://github.com/exuanbo/codemirror-toolkit/tree/main/packages/react#readme)

## Installation

```sh
# npm
npm install @codemirror-toolkit/react

# Yarn
yarn add @codemirror-toolkit/react
```

Note that, you also need to install the peer dependencies `@codemirror/state` and `@codemirror/view` if you don't use the official all-in-one package [`codemirror`](https://www.npmjs.com/package/codemirror) or your package manager doesn't do it automatically.

## Usage

First create an instance with your configuration as an object or a factory function:

```tsx
import { createCodeMirror } from '@codemirror-toolkit/react'

const codeMirror = createCodeMirror<HTMLDivElement>(prevState => ({
  doc: prevState?.doc ?? 'Hello World!',
  // ...otherConfig,
}))

// if you want to use them in other files
export const { useViewEffect, useContainerRef /* ... */ } = codeMirror
```

Then bind your components with the hooks:

```tsx
function Editor() {
  const containerRef = useContainerRef()
  return <div ref={containerRef} />
}

function App() {
  const [showEditor, setShowEditor] = useState(true)
  const [lastInput, setLastInput] = useState('')
  useViewEffect(view => {
    console.log('EditorView is created')
    return () => {
      console.log('EditorView will be destroyed')
      setLastInput(view.state.doc.toString())
    }
  }, [])
  return (
    <>
      <button onClick={() => setShowEditor(!showEditor)}>
        {showEditor ? 'Destroy' : 'Create'} Editor
      </button>
      {showEditor ? (
        <Editor />
      ) : (
        <div>
          <p>Editor destroyed</p>
          <p>Last input: {lastInput}</p>
        </div>
      )}
    </>
  )
}
```

:warning: An instance of `EditorView` will be created **only when** a DOM node is assigned to `containerRef.current`, and will be destroyed **only when** `containerRef.current` is set back to `null`.

### With Context Provider

All the functions and hooks created with `createCodeMirror` don't require a context provider to use in different components, but in some cases you may want to instantiate `EditorView` with props from a component. In this case, you can use `createCodeMirrorWithContext` to create an instance with a context provider:

```tsx
import { createCodeMirrorWithContext } from '@codemirror-toolkit/react'

const {
  Provider: CodeMirrorProvider,
  useView,
  useContainerRef,
  // ...
} = createCodeMirrorWithContext<HTMLDivElement>('CodeMirrorContext')

function MenuBar() {
  const view = useView()
  // ...
}

function Editor() {
  const containerRef = useContainerRef()
  return <div ref={containerRef} className="cm-container" />
}

function App({ initialInput }: { initialInput: string }) {
  return (
    <CodeMirrorProvider
      config={{
        doc: initialInput,
        // ...otherConfig,
      }}>
      <MenuBar />
      <Editor />
    </CodeMirrorProvider>
  )
}
```

## API

### Common Types

```ts
import type { EditorState } from '@codemirror/state'
import type { EditorView, EditorViewConfig } from '@codemirror/view'
import type { DependencyList, EffectCallback, MutableRefObject } from 'react'

type EditorViewConfigWithoutParentElement = Omit<EditorViewConfig, 'parent'>
interface CodeMirrorConfig extends EditorViewConfigWithoutParentElement {}

type CodeMirrorConfigCreator = (prevState: EditorState | undefined) => CodeMirrorConfig
type ProvidedCodeMirrorConfig = CodeMirrorConfig | CodeMirrorConfigCreator

type GetView = () => EditorView | undefined
type UseViewHook = () => EditorView | undefined

type ViewEffectCleanup = ReturnType<EffectCallback>
type ViewEffectCallback = (view: EditorView) => ViewEffectCleanup
type UseViewEffectHook = (effect: ViewEffectCallback, deps: DependencyList) => void

type ViewDispath = InstanceType<typeof EditorView>['dispatch']
type ViewNotReadyHandler = ViewDispath
type UseViewDispatchHook = (onViewNotReady?: ViewNotReadyHandler) => ViewDispath

type ContainerRef<ContainerElement extends Element = Element> =
  MutableRefObject<ContainerElement | null>
type UseContainerRefHook<ContainerElement extends Element = Element> =
  () => ContainerRef<ContainerElement>

interface CodeMirror<ContainerElement extends Element = Element> {
  getView: GetView
  useView: UseViewHook
  useViewEffect: UseViewEffectHook
  useViewDispatch: UseViewDispatchHook
  useContainerRef: UseContainerRefHook<ContainerElement>
}
```

### `createCodeMirror`

```ts
function createCodeMirror<ContainerElement extends Element = Element>(
  config?: ProvidedCodeMirrorConfig,
): CodeMirror<ContainerElement>
```

### `createCodeMirrorWithContext`

```ts
import type { ReactNode } from 'react'

interface CodeMirrorProviderProps {
  config?: ProvidedCodeMirrorConfig
  children: ReactNode
}
interface CodeMirrorProvider {
  (props: CodeMirrorProviderProps): JSX.Element
  displayName?: string
}

type UseCodeMirrorContextHook<ContainerElement extends Element = Element> =
  () => CodeMirror<ContainerElement>

interface CodeMirrorWithContext<ContainerElement extends Element = Element> {
  Provider: CodeMirrorProvider
  useContext: UseCodeMirrorContextHook<ContainerElement>
  useView: UseViewHook
  useViewEffect: UseViewEffectHook
  useViewDispatch: UseViewDispatchHook
  useContainerRef: UseContainerRefHook<ContainerElement>
}

function createCodeMirrorWithContext<ContainerElement extends Element = Element>(
  displayName?: string | false,
): CodeMirrorWithContext<ContainerElement>
```

## License

MIT License @ 2022-Present [Xuanbo Cheng](https://github.com/exuanbo)
