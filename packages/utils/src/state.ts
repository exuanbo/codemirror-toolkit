import type { StateEffect } from '@codemirror/state'

export function mapStateEffectValue<T, R>(effect: StateEffect<T>, fn: (value: T) => R): R {
  return fn(effect.value)
}
