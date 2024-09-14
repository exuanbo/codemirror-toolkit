import { noop, setupUserEvent } from '@codemirror-toolkit/test-utils'
import { render, renderHook, screen } from '@testing-library/react'
import { useCallback, useEffect } from 'react'
import { describe, expect, test, vi } from 'vitest'

import { createContext } from '../src/context'
import { defineViewEffect, useView, useViewEffect } from '../src/hooks'

describe('createContext', () => {
  test('Provider and useCodeMirror', () => {
    const { Provider, useCodeMirror } = createContext()
    vi.spyOn(console, 'error').mockImplementation(noop)

    expect(() => renderHook(() => useCodeMirror())).toThrowErrorMatchingInlineSnapshot(
      `[Error: could not find instance from CodeMirrorContext; please ensure the component is wrapped in a <Provider>]`,
    )
    expect(console.error).toHaveBeenCalled()

    const getConsoleErrorCalledTimes = () => {
      const spy = vi.mocked(console.error)
      return spy.mock.calls.length
    }
    const consoleErrorCalledTimes = getConsoleErrorCalledTimes()

    expect(() => renderHook(() => useCodeMirror(), { wrapper: Provider })).not.toThrow()
    expect(getConsoleErrorCalledTimes()).toBe(consoleErrorCalledTimes)
  })

  test('Provider with config', () => {
    const { Provider, useCodeMirror } = createContext()
    const container = document.createElement('div')

    const { result: hookResult } = renderHook(() => useCodeMirror(), {
      container: document.body.appendChild(container),
      wrapper: ({ children }) => <Provider config={{ doc: 'hello' }}>{children}</Provider>,
    })

    const cm = hookResult.current
    cm.setContainer(container)
    vi.runAllTimers()

    expect(container).not.toBeEmptyDOMElement()
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  test('hook from context', async () => {
    const { Provider: CodeMirrorProvider, useCodeMirror } = createContext()
    const logViewEffect = defineViewEffect(() => {
      console.log('view effect fired')
    })

    function TestComponent() {
      const cm = useCodeMirror()
      const view = useView(cm)
      useViewEffect(cm, logViewEffect)

      useEffect(() => {
        console.log(view ? 'view is ready' : 'view is not ready')
      }, [view])

      const handleClick = useCallback(() => {
        const view = cm.getView()
        console.log('current view: ', view)
        if (view) {
          view.dispatch({
            changes: {
              from: 0,
              insert: 'hello',
            },
          })
        }
      }, [cm])

      return (
        <>
          <div ref={cm.setContainer} />
          <button onClick={handleClick}>click</button>
        </>
      )
    }

    const userEvent = setupUserEvent()
    vi.spyOn(console, 'log').mockImplementation(noop)

    render(<TestComponent />, { wrapper: CodeMirrorProvider })

    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenNthCalledWith(1, 'view is not ready')

    await userEvent.click(screen.getByText('click'))
    expect(screen.getByText('hello')).toBeInTheDocument()

    expect(console.log).toHaveBeenCalledTimes(4)
    expect(console.log).toHaveBeenNthCalledWith(2, 'view effect fired')
    expect(console.log).toHaveBeenNthCalledWith(3, 'view is ready')
    expect(console.log).toHaveBeenNthCalledWith(4, 'current view: ', expect.any(Object))
  })
})
