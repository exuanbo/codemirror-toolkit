# @codemirror-toolkit/react

[![npm (scoped)](https://img.shields.io/npm/v/@codemirror-toolkit/react.svg)](https://www.npmjs.com/package/@codemirror-toolkit/react)
[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@codemirror-toolkit/react.svg?label=bundle%20size)](https://bundlephobia.com/package/@codemirror-toolkit/react)
[![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/exuanbo/codemirror-toolkit/test.yml.svg?branch=main)](https://github.com/exuanbo/codemirror-toolkit/actions)
[![Codecov branch](https://img.shields.io/codecov/c/gh/exuanbo/codemirror-toolkit/main.svg?flag=react&token=3bCICigsEr)](https://app.codecov.io/gh/exuanbo/codemirror-toolkit/tree/main/packages/react/src)

A small and flexible solution for binding [CodeMirror 6](https://codemirror.net/) to React.

Instead of providing component with a big amount of props and un-tree-shakable dependencies (like [@uiw/react-codemirror](https://github.com/uiwjs/react-codemirror)), it offers a set of hooks and an _optional_ context provider that can be used to better integrate with your components.

## Examples

See [codemirror-toolkit#examples](https://github.com/exuanbo/codemirror-toolkit#examples).

## Installation

```sh
# npm
npm install @codemirror-toolkit/react

# Yarn
yarn add @codemirror-toolkit/react
```

Note that, you also need to install the peer dependencies `@codemirror/state` and `@codemirror/view` if you don't use the official all-in-one package [`codemirror`](https://www.npmjs.com/package/codemirror) or your package manager doesn't do it automatically.

## Usage

First create an instance with configuration as an object or a factory function:

```ts
import { createCodeMirror } from '@codemirror-toolkit/react'

const codeMirror = createCodeMirror<HTMLDivElement>((prevState) => ({
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
  useViewEffect((view) => {
    console.log('EditorView is created')
    return () => {
      console.log('EditorView is destroyed')
      // expect(view.dom.parentElement).toBeNull()
      setLastInput(view.state.doc.toString())
    }
  })
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

All the functions and hooks created with `createCodeMirror` don't require a context provider to use in different components, but in some cases you may want to instantiate `EditorView` with props from a component. In this case, you can use `createCodeMirrorWithContext` to create an instance within a context:

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
  return <div ref={containerRef} />
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

> 🚧 Documentation is WIP.

There are only two functions exported: `createCodeMirror` and `createCodeMirrorWithContext`.

### Common Types

```ts
import type { EditorState } from '@codemirror/state'
import type { EditorView, EditorViewConfig } from '@codemirror/view'
import type { EffectCallback, MutableRefObject } from 'react'

type EditorViewConfigWithoutParentElement = Omit<EditorViewConfig, 'parent'>
interface CodeMirrorConfig extends EditorViewConfigWithoutParentElement {}

type CodeMirrorConfigCreator = (prevState: EditorState | undefined) => CodeMirrorConfig
type ProvidedCodeMirrorConfig = CodeMirrorConfig | CodeMirrorConfigCreator

type GetView = () => EditorView | null
type UseViewHook = () => EditorView | null

type ViewEffectCleanup = ReturnType<EffectCallback>
type ViewEffectSetup = (view: EditorView) => ViewEffectCleanup
type UseViewEffectHook = (setup: ViewEffectSetup) => void

type ViewDispath = typeof EditorView.prototype.dispatch
type UseViewDispatchHook = () => ViewDispath

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
function createCodeMirror<ContainerElement extends Element>(
  config?: ProvidedCodeMirrorConfig,
): CodeMirror<ContainerElement>
```

### `createCodeMirrorWithContext`

```ts
import type { FunctionComponent, PropsWithChildren } from 'react'

interface CodeMirrorProps {
  config?: ProvidedCodeMirrorConfig
}
interface CodeMirrorProviderProps extends PropsWithChildren<CodeMirrorProps> {}
interface CodeMirrorProvider extends FunctionComponent<CodeMirrorProviderProps> {}

type UseCodeMirrorContextHook<ContainerElement extends Element = Element> =
  () => CodeMirror<ContainerElement>

type UseGetViewHook = () => GetView

interface CodeMirrorWithContext<ContainerElement extends Element = Element> {
  Provider: CodeMirrorProvider
  useContext: UseCodeMirrorContextHook<ContainerElement>
  useGetView: UseGetViewHook
  useView: UseViewHook
  useViewEffect: UseViewEffectHook
  useViewDispatch: UseViewDispatchHook
  useContainerRef: UseContainerRefHook<ContainerElement>
}

function createCodeMirrorWithContext<ContainerElement extends Element>(
  displayName?: string | false,
): CodeMirrorWithContext<ContainerElement>
```

## License

MIT License @ 2022-Present [Xuanbo Cheng](https://github.com/exuanbo)
