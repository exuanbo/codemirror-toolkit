import { act, cleanup, render, renderHook, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { createCodeMirror } from '../src/create.js'

describe('createCodeMirror', () => {
  describe('without component', () => {
    test('initialize', () => {
      const { getView, useContainerRef } = createCodeMirror()
      const { result: renderUseContainerRefResult } = renderHook(() => useContainerRef())
      const containerRef = renderUseContainerRefResult.current
      expect(containerRef).toEqual({ current: null })
      expect(getView()).toBeUndefined()
    })

    test('create EditorView', () => {
      const { getView, useContainerRef } = createCodeMirror()
      const { result: renderUseContainerRefResult } = renderHook(() => useContainerRef())
      const containerRef = renderUseContainerRefResult.current
      const containerElement = document.createElement('div')
      containerRef.current = containerElement
      vi.runAllTimers()
      expect(containerElement).not.toBeEmptyDOMElement()
      expect(getView()).toBeDefined()
    })

    test('debounce', () => {
      const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
      const { getView, useContainerRef } = createCodeMirror()
      const { result: renderUseContainerRefResult } = renderHook(() => useContainerRef())
      const containerRef = renderUseContainerRefResult.current
      const containerElement = document.createElement('div')
      containerRef.current = containerElement
      expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1)
      containerRef.current = containerElement
      expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1)
      containerRef.current = null
      expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(2)
      vi.runAllTimers()
      expect(containerElement).toBeEmptyDOMElement()
      expect(getView()).toBeUndefined()
    })

    test('destroy EditorView', () => {
      const { getView, useContainerRef } = createCodeMirror()
      const { result: renderUseContainerRefResult } = renderHook(() => useContainerRef())
      const containerRef = renderUseContainerRefResult.current
      const containerElement = document.createElement('div')
      containerRef.current = containerElement
      vi.runAllTimers()
      expect(containerElement).not.toBeEmptyDOMElement()
      expect(getView()).toBeDefined()
      containerRef.current = null
      vi.runAllTimers()
      expect(containerElement).toBeEmptyDOMElement()
      expect(getView()).toBeUndefined()
    })

    test('config factory', () => {
      const { getView, useContainerRef } = createCodeMirror((prevState) => ({
        doc: prevState?.doc.slice(3) ?? 'hello',
      }))
      const { result: renderUseContainerRefResult } = renderHook(() => useContainerRef())
      const containerRef = renderUseContainerRefResult.current
      const containerElementA = document.createElement('div')
      containerRef.current = containerElementA
      vi.runAllTimers()
      expect(containerElementA).not.toBeEmptyDOMElement()
      expect(getView()?.state.doc.toString()).toBe('hello')
      const containerElementB = document.createElement('div')
      containerRef.current = containerElementB
      vi.runAllTimers()
      expect(containerElementA).toBeEmptyDOMElement()
      expect(containerElementB).not.toBeEmptyDOMElement()
      expect(getView()?.state.doc.toString()).toBe('lo')
    })
  })

  describe('with componet', () => {
    afterEach(() => {
      cleanup()
    })

    test('mount and unmount', () => {
      const { getView, useContainerRef } = createCodeMirror<HTMLDivElement>()
      function App() {
        const containerRef = useContainerRef()
        return <div ref={containerRef} />
      }
      const { unmount } = render(<App />)
      expect(getView()).toBeUndefined()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      vi.runAllTimers()
      expect(getView()).toBeDefined()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      unmount()
      vi.runAllTimers()
      expect(getView()).toBeUndefined()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    test('useView hook', () => {
      const { useContainerRef, useView } = createCodeMirror<HTMLDivElement>()
      function App() {
        const containerRef = useContainerRef()
        const view = useView()
        useEffect(() => {
          view?.dispatch({
            changes: {
              from: 0,
              insert: 'hello',
            },
          })
        }, [view])
        return <div ref={containerRef} />
      }
      render(<App />)
      act(() => {
        vi.runAllTimers()
      })
      expect(screen.getByText('hello')).toBeInTheDocument()
    })

    test('useViewEffect hook', () => {
      const { useContainerRef, useViewEffect } = createCodeMirror<HTMLDivElement>()
      function App() {
        const containerRef = useContainerRef()
        useViewEffect((view) => {
          view.dispatch({
            changes: {
              from: 0,
              insert: 'hello',
            },
          })
        }, [])
        return <div ref={containerRef} />
      }
      render(<App />)
      act(() => {
        vi.runAllTimers()
      })
      expect(screen.getByText('hello')).toBeInTheDocument()
    })

    test('useViewDispatch hook', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0)
      const { useContainerRef, useViewDispatch } = createCodeMirror<HTMLDivElement>()
      function App() {
        const containerRef = useContainerRef()
        const viewDispatch = useViewDispatch(() => {
          console.error('view is not ready')
        })
        useEffect(() => {
          viewDispatch({
            changes: {
              from: 0,
              insert: 'hello',
            },
          })
        })
        return <div ref={containerRef} />
      }
      const { rerender } = render(<App />)
      vi.runAllTimers()
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith('view is not ready')
      expect(screen.queryByText('hello')).not.toBeInTheDocument()
      rerender(<App />)
      expect(screen.getByText('hello')).toBeInTheDocument()
    })
  })
})
