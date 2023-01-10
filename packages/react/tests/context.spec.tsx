import { noop, setupUserEvent } from '@codemirror-toolkit/test-utils'
import { act, cleanup, render, renderHook, screen } from '@testing-library/react'
import { useCallback, useEffect } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { createCodeMirrorWithContext } from '../src/context.js'

describe('createCodeMirrorWithContext', () => {
  afterEach(() => {
    cleanup()
  })

  test('Provider and useContext', () => {
    const { Provider, useContext } = createCodeMirrorWithContext('CodeMirrorContext')
    expect(Provider.displayName).toBe('CodeMirrorContext.Provider')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(noop)
    expect(() => renderHook(() => useContext())).toThrowError(
      'could not find CodeMirrorContext value; please ensure the component is wrapped in a <Provider>',
    )
    expect(console.error).toHaveBeenCalled()
    consoleSpy.mockRestore()
    expect(() => renderHook(() => useContext(), { wrapper: Provider })).not.toThrow()
  })

  test('hooks from context', async () => {
    const {
      Provider: CodeMirrorProvider,
      useView,
      useViewEffect,
      useViewDispatch,
      useContainerRef,
    } = createCodeMirrorWithContext<HTMLDivElement>()
    function TestComponent() {
      const view = useView()
      useEffect(() => {
        console.log(view ? 'view is ready' : 'view is not ready')
      }, [view])
      useViewEffect(() => {
        console.log('viewEffect')
      }, [])
      const viewDispatch = useViewDispatch(() => {
        console.error('view is not ready')
      })
      const handleClick = useCallback(() => {
        viewDispatch({
          changes: {
            from: 0,
            insert: 'hello',
          },
        })
      }, [viewDispatch])
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
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('view is not ready')
    expect(screen.queryByText('hello')).not.toBeInTheDocument()
    act(() => {
      vi.runAllTimers()
    })
    expect(console.log).toHaveBeenCalledTimes(3)
    expect(console.log).toHaveBeenNthCalledWith(2, 'view is ready')
    expect(console.log).toHaveBeenNthCalledWith(3, 'viewEffect')
    await userEvent.click(screen.getByText('click'))
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
