import { noop, setupUserEvent } from '@codemirror-toolkit/test-utils'
import { act, render, renderHook, screen } from '@testing-library/react'
import { useCallback, useEffect } from 'react'
import { describe, expect, test, vi } from 'vitest'

import { createCodeMirrorWithContext } from '../src/context.js'

describe('createCodeMirrorWithContext', () => {
  test('Provider and useContext', () => {
    const { Provider, useContext } = createCodeMirrorWithContext('CodeMirrorContext')
    expect(Provider.displayName).toBe('CodeMirrorContext.Provider')
    vi.spyOn(console, 'error').mockImplementation(noop)
    expect(() => renderHook(() => useContext())).toThrowError(
      'could not find CodeMirrorContext value; please ensure the component is wrapped in a <Provider>',
    )
    expect(console.error).toHaveBeenCalled()
    const getConsoleErrorCalledTimes = () => {
      const spy = vi.mocked(console.error)
      return spy.mock.calls.length
    }
    const consoleErrorCalledTimes = getConsoleErrorCalledTimes()
    expect(() => renderHook(() => useContext(), { wrapper: Provider })).not.toThrow()
    expect(getConsoleErrorCalledTimes()).toBe(consoleErrorCalledTimes)
  })

  test('Provider with config', () => {
    const { Provider, useContainerRef } = createCodeMirrorWithContext<HTMLDivElement>()
    const containerElement = document.createElement('div')
    const { result: renderUseContainerRefResult } = renderHook(() => useContainerRef(), {
      container: document.body.appendChild(containerElement),
      wrapper: ({ children }) => <Provider config={{ doc: 'hello' }}>{children}</Provider>,
    })
    const containerRef = renderUseContainerRefResult.current
    containerRef.current = containerElement
    vi.runAllTimers()
    expect(containerElement).not.toBeEmptyDOMElement()
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  test('hooks from context', async () => {
    const {
      Provider: CodeMirrorProvider,
      useGetView,
      useView,
      useViewEffect,
      useViewDispatch,
      useContainerRef,
    } = createCodeMirrorWithContext<HTMLDivElement>()
    function TestComponent() {
      const getView = useGetView()
      const view = useView()
      useEffect(() => {
        console.log(view ? 'view is ready' : 'view is not ready')
      }, [view])
      useViewEffect(() => {
        console.log('view effect fired')
      }, [])
      const viewDispatch = useViewDispatch()
      const handleClick = useCallback(() => {
        console.log('current view: ', getView())
        try {
          viewDispatch({
            changes: {
              from: 0,
              insert: 'hello',
            },
          })
        } catch {
          console.error('view dispatch failed')
        }
      }, [getView, viewDispatch])
      const containerRef = useContainerRef()
      return (
        <>
          <div ref={containerRef} />
          <button onClick={handleClick}>click</button>
        </>
      )
    }
    const userEvent = setupUserEvent()
    vi.spyOn(console, 'log').mockImplementation(noop)
    vi.spyOn(console, 'error').mockImplementation(noop)
    render(<TestComponent />, { wrapper: CodeMirrorProvider })
    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenNthCalledWith(1, 'view is not ready')
    await userEvent.click(screen.getByText('click'))
    expect(console.log).toHaveBeenCalledTimes(2)
    expect(console.log).toHaveBeenNthCalledWith(2, 'current view: ', null)
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('view dispatch failed')
    expect(screen.queryByText('hello')).not.toBeInTheDocument()
    act(() => {
      vi.runAllTimers()
    })
    expect(console.log).toHaveBeenCalledTimes(4)
    expect(console.log).toHaveBeenNthCalledWith(3, 'view is ready')
    expect(console.log).toHaveBeenNthCalledWith(4, 'view effect fired')
    await userEvent.click(screen.getByText('click'))
    expect(console.log).toHaveBeenCalledTimes(5)
    expect(console.log).toHaveBeenNthCalledWith(5, 'current view: ', expect.any(Object))
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
