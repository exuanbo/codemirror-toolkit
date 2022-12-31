import type { EffectCallback, MutableRefObject, RefObject } from 'react'

import { useSingleton } from './useSingleton.js'
import { useSyncedRef } from './useSyncedRef.js'

type RefEffectCleanup = ReturnType<EffectCallback>
type RefEffectCallback<T> = (value: T) => RefEffectCleanup

export function useRefWithEffect<T>(
  initialValue: T,
  effect: RefEffectCallback<T>,
): MutableRefObject<T>

export function useRefWithEffect<T>(
  initialValue: T | null,
  effect: RefEffectCallback<T | null>,
): RefObject<T>

export function useRefWithEffect<T>(initialValue: T | null, effect: RefEffectCallback<T | null>) {
  const effectRef = useSyncedRef(effect)
  return useSingleton(() => {
    let currentValue = initialValue
    let cleanup: RefEffectCleanup
    return {
      get current() {
        return currentValue
      },
      set current(value) {
        if (value === currentValue) {
          return
        }
        currentValue = value
        cleanup?.()
        const callback = effectRef.current
        cleanup = callback(value)
      },
    }
  })
}
