import { useRef } from 'react'

import { isFunction } from './isFunction.js'

export function useSingleton<T extends {}>(instance: T | (() => T)): T {
  const instanceRef = useRef<T | null>(null)
  if (instanceRef.current === null) {
    // https://github.com/microsoft/TypeScript/issues/37663
    instanceRef.current = isFunction(instance) ? instance() : instance
  }
  return instanceRef.current
}
