import { useRef } from 'react'

import { useInsertionEffectWithSyncFallback } from './useInsertionEffectWithFallbacks.js'

interface ImmutableRefObject<T> {
  readonly current: T
}

export function useSyncedRef<T>(value: T): ImmutableRefObject<T> {
  const ref = useRef(value)
  useInsertionEffectWithSyncFallback(() => {
    ref.current = value
  }, [value])
  return ref
}
