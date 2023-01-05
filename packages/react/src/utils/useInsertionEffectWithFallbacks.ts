import * as React from 'react'

const isBrowser = typeof window !== 'undefined'

const builtInAPI = React.useInsertionEffect

const syncFallback: typeof builtInAPI = function (effect) {
  effect()
}

export const useInsertionEffectWithSyncFallback = isBrowser
  ? builtInAPI ?? syncFallback
  : syncFallback
