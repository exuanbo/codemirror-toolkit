import { noop } from '@codemirror-toolkit/test-utils'
import { act, render } from '@testing-library/react'
import { PropsWithChildren, useEffect, useSyncExternalStore } from 'react'
import { describe, expect, test, vi } from 'vitest'

import { create } from '../src/create'
import { defineViewEffect } from '../src/hooks'

describe('create', () => {
  describe('without component', () => {
    test('initialize', () => {
      const { getView, subscribe, setContainer, setConfig } = create()
      expect(getView()).toBeNull()
      expect(subscribe).toBeTypeOf('function')
      expect(setContainer).toBeTypeOf('function')
      expect(setConfig).toBeTypeOf('function')
    })

    test('create EditorView', () => {
      const { getView, setContainer } = create()
      const container = document.createElement('div')
      setContainer(container)
      expect(container).toBeEmptyDOMElement()
      expect(getView()).toBeNull()
      vi.runAllTimers()
      expect(container).not.toBeEmptyDOMElement()
      expect(getView()).not.toBeNull()
      const view = getView()
      expect(view).not.toBeNull()
      expect(container).toContainElement(view!.dom)
    })

    test('debounce setContainer calls', () => {
      vi.spyOn(window, 'queueMicrotask')
      const { getView, setContainer } = create()
      const container = document.createElement('div')
      setContainer(container)
      setContainer(container)
      setContainer(null)
      setContainer(null)
      expect(window.queueMicrotask).toHaveBeenCalledTimes(1)
      expect(getView()).toBeNull()
      vi.runAllTimers()
      expect(getView()).toBeNull()
      expect(container).toBeEmptyDOMElement()
    })

    test('destroy EditorView', () => {
      const { getView, setContainer } = create()
      const container = document.createElement('div')
      document.body.appendChild(container)
      setContainer(container)
      vi.runAllTimers()

      const view = getView()
      expect(view).not.toBeNull()
      expect(view?.dom.isConnected).toBe(true)

      setContainer(null)
      vi.runAllTimers()

      expect(container).toBeEmptyDOMElement()
      expect(getView()).toBeNull()
      expect(view?.dom.isConnected).toBe(false)
    })

    test('config factory and setConfig', () => {
      const { getView, setContainer, setConfig } = create((prevState) => ({
        doc: prevState?.doc.slice(3) ?? 'hello',
      }))
      const container = document.createElement('div')
      setContainer(container)
      vi.runAllTimers()
      expect(getView()?.state.doc.toString()).toBe('hello')

      setConfig({ doc: 'world' })
      vi.runAllTimers()
      expect(getView()?.state.doc.toString()).toBe('world')

      setConfig((prevState) => ({
        doc: (prevState?.doc?.toString() ?? '') + '!',
      }))
      vi.runAllTimers()
      expect(getView()?.state.doc.toString()).toBe('world!')
    })

    test('debounce setConfig calls', () => {
      vi.spyOn(window, 'queueMicrotask')
      const { getView, setContainer, setConfig } = create()
      const container = document.createElement('div')
      setContainer(container)
      vi.runAllTimers()

      setConfig({ doc: 'First' })
      setConfig({ doc: 'Second' })
      setConfig({ doc: 'Third' })

      expect(window.queueMicrotask).toHaveBeenCalledTimes(2) // One for setContainer, one for setConfig
      expect(getView()?.state.doc.toString()).toBe('')

      vi.runAllTimers()
      expect(getView()?.state.doc.toString()).toBe('Third')
    })

    test('destroy EditorView', () => {
      const { getView, setContainer } = create()
      const container = document.createElement('div')
      document.body.appendChild(container)
      setContainer(container)
      vi.runAllTimers()

      const view = getView()
      expect(view).not.toBeNull()
      expect(view?.dom.isConnected).toBe(true)

      setContainer(null)
      vi.runAllTimers()

      expect(container).toBeEmptyDOMElement()
      expect(getView()).toBeNull()
      expect(view?.dom.isConnected).toBe(false)
    })
  })

  describe('with component', () => {
    test('mount and unmount', () => {
      const { getView, setContainer } = create()
      function TestComponent() {
        return <div ref={setContainer} />
      }
      const { unmount } = render(<TestComponent />)
      expect(getView()).toBeNull()
      vi.runAllTimers()
      const view = getView()
      expect(view).not.toBeNull()
      expect(view?.dom.isConnected).toBe(true)
      unmount()
      vi.runAllTimers()
      expect(getView()).toBeNull()
      expect(view?.dom.isConnected).toBe(false)
    })

    test('useView hook', async () => {
      const { getView, useView, setContainer } = create()

      function TestComponent() {
        const view = useView()

        useEffect(() => {
          if (view) {
            console.log('View is available')
            view.dispatch({
              changes: { from: 0, insert: 'Hello from useView' },
            })
          }
        }, [view])

        return <div ref={setContainer} />
      }

      vi.spyOn(console, 'log').mockImplementation(noop)
      const { unmount } = render(<TestComponent />)

      expect(console.log).not.toHaveBeenCalled()

      await act(() => vi.runAllTimers())

      expect(console.log).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledWith('View is available')

      const view = getView()
      expect(view).not.toBeNull()
      expect(view?.state.doc.toString()).toBe('Hello from useView')

      unmount()
      vi.runAllTimers()
      expect(getView()).toBeNull()
    })

    test('useViewEffect hook', () => {
      const { getView, useViewEffect, setContainer } = create()

      const viewEffect = defineViewEffect((view) => {
        console.log('effect created')
        view.dispatch({
          changes: { from: 0, insert: 'hello' },
        })
        return () => {
          console.log('effect destroyed')
        }
      })

      function TestComponent() {
        useViewEffect(viewEffect)
        return <div ref={setContainer} />
      }

      vi.spyOn(console, 'log').mockImplementation(noop)
      const { rerender, unmount } = render(<TestComponent />)
      vi.runAllTimers()

      expect(console.log).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledWith('effect created')
      expect(getView()?.state.doc.toString()).toBe('hello')

      rerender(<TestComponent />)
      vi.runAllTimers()
      expect(console.log).toHaveBeenCalledTimes(1)

      unmount()
      vi.runAllTimers()
      expect(console.log).toHaveBeenCalledTimes(2)
      expect(console.log).toHaveBeenLastCalledWith('effect destroyed')
    })

    test('useViewEffect hook with view created', async () => {
      const { getView, useViewEffect, subscribe, setContainer } = create()

      function TestParentComponent({ children }: PropsWithChildren) {
        const hasView = useSyncExternalStore(subscribe, () => !!getView())
        return (
          <>
            <div ref={setContainer} />
            {hasView && children}
          </>
        )
      }

      function TestComponent() {
        useViewEffect(() => {
          console.log('effect created')
          return () => {
            console.log('effect destroyed')
          }
        })
        return null
      }

      vi.spyOn(console, 'log').mockImplementation(noop)
      const { unmount } = render(
        <TestParentComponent>
          <TestComponent />
        </TestParentComponent>,
      )

      await act(() => vi.runAllTimers())
      expect(console.log).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledWith('effect created')
      expect(getView()).not.toBeNull()

      setContainer(null)
      await act(() => vi.runAllTimers())
      expect(console.log).toHaveBeenCalledTimes(2)
      expect(console.log).toHaveBeenLastCalledWith('effect destroyed')
      expect(getView()).toBeNull()

      unmount()
      vi.runAllTimers()
      expect(console.log).toHaveBeenCalledTimes(2)
    })

    test('useViewEffect hook with setConfig', () => {
      const { getView, useViewEffect, setContainer, setConfig } = create()

      const viewEffect = defineViewEffect((_view) => {
        console.log('effect created')
        return () => {
          console.log('effect destroyed')
        }
      })

      function TestComponent() {
        useEffect(() => {
          setConfig({ doc: 'hello' })
        }, [])
        useViewEffect(viewEffect)
        return <div ref={setContainer} />
      }

      vi.spyOn(console, 'log').mockImplementation(noop)
      const { rerender, unmount } = render(<TestComponent />)
      vi.runAllTimers()

      expect(console.log).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledWith('effect created')
      expect(getView()?.state.doc.toString()).toBe('hello')

      setConfig({ doc: 'world' })
      vi.runAllTimers()

      expect(console.log).toHaveBeenCalledTimes(3)
      expect(console.log).toHaveBeenNthCalledWith(2, 'effect destroyed')
      expect(console.log).toHaveBeenNthCalledWith(3, 'effect created')
      expect(getView()?.state.doc.toString()).toBe('world')

      rerender(<TestComponent />)
      vi.runAllTimers()
      expect(console.log).toHaveBeenCalledTimes(3)

      unmount()
      vi.runAllTimers()
      expect(console.log).toHaveBeenCalledTimes(4)
      expect(console.log).toHaveBeenLastCalledWith('effect destroyed')
    })
  })
})
