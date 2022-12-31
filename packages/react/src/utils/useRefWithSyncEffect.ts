import type { EffectCallback, MutableRefObject, RefObject } from 'react'

import { useSingleton } from './useSingleton.js'
import { useSyncedRef } from './useSyncedRef.js'

interface SyncEffectApi<T> {
  isInvoking: () => boolean
  invokeWith: (value: T) => void
}

type SyncEffectCleanup = ReturnType<EffectCallback>
type SyncEffectCallback<T> = (value: T) => SyncEffectCleanup

export function useRefWithSyncEffect<T>(
  initialValue: T,
  effect: SyncEffectCallback<T>,
): MutableRefObject<T>

export function useRefWithSyncEffect<T>(
  initialValue: T | null,
  effect: SyncEffectCallback<T | null>,
): RefObject<T>

export function useRefWithSyncEffect<T>(
  initialValue: T | null,
  effect: SyncEffectCallback<T | null>,
): MutableRefObject<T | null> {
  const effectRef = useSyncedRef(effect)
  const effectApi = useSingleton<SyncEffectApi<T | null>>(() => {
    let isInvoking = false
    let cleanup: SyncEffectCleanup
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
