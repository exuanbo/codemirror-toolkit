import { useCallback, useEffect, useInsertionEffect, useRef } from 'react'

/* v8 ignore next */
const useIsomorphicInsertionEffect = typeof window !== 'undefined' ? useInsertionEffect : useEffect

export function useEffectEvent<Args extends unknown[], Result>(event: (...args: Args) => Result) {
  const eventRef = useRef<typeof event>(null!)

  useIsomorphicInsertionEffect(() => {
    eventRef.current = event
  }, [event])

  return useCallback<typeof event>((...args) => {
    const fn = eventRef.current
    return fn(...args)
  }, [])
}
