import { useRef } from 'react'

export function useSingleton<T extends {}>(createInstance: () => T): T {
  const instanceRef = useRef<T | null>(null)
  if (instanceRef.current == null) {
    instanceRef.current = createInstance()
  }
  return instanceRef.current
}
