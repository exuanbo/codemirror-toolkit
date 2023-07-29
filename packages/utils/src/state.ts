import type { StateEffect, StateEffectType } from '@codemirror/state'

export function isEffectOfType<T>(type: StateEffectType<T>) {
  return (effect: StateEffect<unknown>): effect is StateEffect<T> => effect.is(type)
}

export function mapEffectValue<T, R>(fn: (value: T) => R): (effect: StateEffect<T>) => R

export function mapEffectValue<T, R>(effect: StateEffect<T>, fn: (value: T) => R): R

export function mapEffectValue<T, R>(
  arg1: ((value: T) => R) | StateEffect<T>,
  arg2?: (value: T) => R,
) {
  return typeof arg1 === 'function'
    ? (effect: StateEffect<T>) => arg1(effect.value)
    : arg2!(arg1.value)
}

export function filterEffects<T>(
  effects: readonly StateEffect<unknown>[],
  type: StateEffectType<T>,
): StateEffect<T>[] {
  return effects.filter(isEffectOfType(type))
}
