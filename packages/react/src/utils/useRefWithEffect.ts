import type { EffectCallback, MutableRefObject, RefObject } from 'react'

import { useSingleton } from './useSingleton.js'
import { useSyncedRef } from './useSyncedRef.js'

interface RefEffectApi<T> {
  isInvoking: () => boolean
  invokeWith: (value: T) => void
}

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

export function useRefWithEffect<T>(
  initialValue: T | null,
  effect: RefEffectCallback<T | null>,
): MutableRefObject<T | null> {
  const effectRef = useSyncedRef(effect)
  const effectApi = useSingleton<RefEffectApi<T | null>>(() => {
    let isInvoking = false
    let cleanup: RefEffectCleanup
    return {
      isInvoking: () => isInvoking,
      invokeWith: value => {
        isInvoking = true
        cleanup?.()
        const callback = effectRef.current
        cleanup = callback(value)
        isInvoking = false
      },
    }
  })
  return useSingleton(() => {
    let currentValue = initialValue
    return {
      get current() {
        return currentValue
      },
      set current(value) {
        if (effectApi.isInvoking()) {
          throw new Error('Cannot change ref value in effect callback')
        }
        if (value !== currentValue) {
          currentValue = value
          effectApi.invokeWith(value)
        }
      },
    }
  })
}
