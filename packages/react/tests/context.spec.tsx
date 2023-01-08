import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { useCallback, useEffect } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { createCodeMirrorWithContext } from '../src/context.js'
import { noop } from './test-utils.js'

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

  test('hooks from context', () => {
    vi.spyOn(console, 'log').mockImplementation(noop)
    vi.spyOn(console, 'error').mockImplementation(noop)
    const { Provider, useContainerRef, useView, useViewEffect, useViewDispatch } =
      createCodeMirrorWithContext<HTMLDivElement>()
    function TestComponent() {
      const containerRef = useContainerRef()
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
      return (
        <>
          <div ref={containerRef} />
          <button onClick={handleClick}>click</button>
        </>
      )
    }
    render(<TestComponent />, { wrapper: Provider })
    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenNthCalledWith(1, 'view is not ready')
    fireEvent.click(screen.getByText('click'))
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('view is not ready')
    act(() => {
      vi.runAllTimers()
    })
    expect(console.log).toHaveBeenCalledTimes(3)
    expect(console.log).toHaveBeenNthCalledWith(2, 'view is ready')
    expect(console.log).toHaveBeenNthCalledWith(3, 'viewEffect')
    fireEvent.click(screen.getByText('click'))
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
