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

# pnpm
pnpm add @codemirror-toolkit/react
```

Note that, you also need to install the peer dependencies `@codemirror/state` and `@codemirror/view` if you don't use the official all-in-one package [`codemirror`](https://www.npmjs.com/package/codemirror) or your package manager doesn't do it automatically.

<details>
<summary><h2>Migrate from 0.6.x</h2></summary>

- `createCodeMirror` is refactored to a core function without hooks. Use `create` instead for a similar functionality with hooks.

  Before:

  ```typescript
  const cm = createCodeMirror(config)
  ```

  After:

  ```typescript
  const cm = create(config)
  ```

- `create` now provides `useView` and `useViewEffect` hooks.

  Before:

  ```typescript
  const { useView, useViewEffect } = createCodeMirror(config)
  ```

  After:

  ```typescript
  const { useView, useViewEffect } = create(config)
  ```

- `createCodeMirrorContext` is renamed to `createContext` and does not provide hooks directly. Use `useCodeMirror` to access the CodeMirror instance, then use the exported hooks with this instance.

  Before:

  ```typescript
  const { Provider, useView, useViewEffect } = createCodeMirrorContext()
  ```

  After:

  ```typescript
  import { useView, useViewEffect } from '@codemirror-toolkit/react'

  const { Provider, useCodeMirror } = createContext()
  // Then in your component:
  const cm = useCodeMirror()
  useView(cm)
  useViewEffect(cm, effectSetup)
  ```

- `useViewEffect` now requires the setup function to be memoized or have a stable reference to prevent the effect from firing on every render.

  Before:

  ```typescript
  useViewEffect((view) => {
    // Effect logic
  })
  ```

  After:

  <!-- prettier-ignore -->
  ```typescript
  const effectSetup = useCallback((view) => {
    // Effect logic
  }, [/* dependencies */])

  useViewEffect(cm, effectSetup)
  ```

- The `useContainerRef` hook has been replaced with a `setContainer` function.

  Before:

  ```typescript
  const { useContainerRef } = createCodeMirror(config)

  function Editor() {
    const containerRef = useContainerRef()
    return <div ref={containerRef} />
  }
  ```

  After:

  ```typescript
  const { setContainer } = create(config)

  function Editor() {
    return <div ref={setContainer} />
  }
  ```

- Configuration can now be set using `setConfig`.

  ```typescript
  const { setConfig } = create()
  setConfig(config)
  ```

</details>

## Usage

First create an instance with configuration as an object or a factory function:

<!-- prettier-ignore -->
```ts
import { create } from '@codemirror-toolkit/react'

const cm = create((prevState) => ({
  state: prevState, // useful for HMR
  doc: 'Hello World!',
}))

export const {
  getView,
  useView,
  useViewEffect,
  setContainer,
  setConfig,
} = cm
```

Then bind your components with a callback ref:

```tsx
function Editor() {
  return <div ref={setContainer} />
}
```

### Initiate with data from component

#### Option 1:

<!-- prettier-ignore -->
```tsx
import { create } from '@codemirror-toolkit/react'
import { useCallback } from 'react'

const { setContainer, setConfig } = create()

interface Props {
  initialInput: string
}

function Editor({ initialInput }: Props) {
  const ref = useCallback((node: HTMLDivElement | null) => {
    setContainer(node)
    if (node) {
      setConfig({
        doc: initialInput,
      })
    }
  }, [initialInput])
  return <div ref={ref} />
}
```

#### Option 2:

Use `createContext`, see below.

### With Context Provider

```tsx
import { createContext } from '@codemirror-toolkit/react'

const { Provider: CodeMirrorProvider, useCodeMirror } = createContext()

function Editor() {
  const { setContainer } = useCodeMirror()
  return <div ref={setContainer} />
}

interface Props {
  initialInput: string
}

function EditorWrapper({ initialInput }: Props) {
  return (
    <CodeMirrorProvider
      config={{
        doc: initialInput,
      }}>
      <Editor />
    </CodeMirrorProvider>
  )
}
```

## API

> 🚧 Documentation is WIP.

### Common Types

```ts
import type { EditorState } from '@codemirror/state'
import type { EditorView, EditorViewConfig } from '@codemirror/view'
import type { EffectCallback } from 'react'

type EditorViewConfigCreator = (prevState: EditorState | undefined) => EditorViewConfig
type CodeMirrorConfig = EditorViewConfig | EditorViewConfigCreator

type ViewChangeHandler = (view: EditorView | null) => void

type ViewContainer = Element | DocumentFragment

interface CodeMirror {
  getView: () => EditorView | null
  subscribe: (onViewChange: ViewChangeHandler) => () => void
  setContainer: (container: ViewContainer | null) => void
  setConfig: (config: CodeMirrorConfig) => void
}

type ViewEffectCleanup = ReturnType<EffectCallback>
type ViewEffectSetup = (view: EditorView) => ViewEffectCleanup

interface CodeMirrorHooks {
  useView: () => EditorView | null
  useViewEffect: (setup: ViewEffectSetup) => void
}

type CodeMirrorWithHooks = CodeMirror & CodeMirrorHooks
```

### `createCodeMirror`

```ts
function createCodeMirror(initialConfig?: CodeMirrorConfig): CodeMirror
```

### `create`

```ts
function create(config?: CodeMirrorConfig): CodeMirrorWithHooks
```

### `createContext`

```ts
import type { FunctionComponent, PropsWithChildren } from 'react'

interface CodeMirrorProps {
  config?: CodeMirrorConfig
}

interface CodeMirrorProviderProps extends PropsWithChildren<CodeMirrorProps> {}

interface CodeMirrorProvider extends FunctionComponent<CodeMirrorProviderProps> {}

interface CodeMirrorContext {
  Provider: CodeMirrorProvider
  useCodeMirror: () => CodeMirror
}

function createContext(): CodeMirrorContext
```

### `useView`

```ts
function useView(cm: CodeMirror): EditorView | null
```

### `useViewEffect`

```ts
function defineViewEffect(setup: ViewEffectSetup): ViewEffectSetup

function useViewEffect(cm: CodeMirror, setup: ViewEffectSetup): void
```

## License

MIT License @ 2022-Present [Xuanbo Cheng](https://github.com/exuanbo)
