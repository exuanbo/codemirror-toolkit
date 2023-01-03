import type { DependencyList, EffectCallback } from 'react'
import React from 'react'

const isBrowser = typeof window !== 'undefined'

const builtInAPI = React.useInsertionEffect

function syncFallback(effect: EffectCallback, _deps?: DependencyList): void {
  effect()
}

export const useInsertionEffectWithSyncFallback = isBrowser
  ? builtInAPI ?? syncFallback
  : syncFallback
