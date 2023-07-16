import type { StateEffect, StateEffectType } from '@codemirror/state'

export function isEffectOfType<T>(type: StateEffectType<T>) {
  return (effect: StateEffect<unknown>): effect is StateEffect<T> => effect.is(type)
}

export function mapEffectValue<T, R>(fn: (value: T) => R) {
  return (effect: StateEffect<T>) => fn(effect.value)
}
