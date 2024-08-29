import type { StateEffect, StateEffectType } from '@codemirror/state'

export function matchEffect<T>(type: StateEffectType<T>) {
  return (effect: StateEffect<unknown>): effect is StateEffect<T> => effect.is(type)
}

export function mapEffectValue<T, R>(fn: (value: T) => R): (effect: StateEffect<T>) => R

export function mapEffectValue<T, R>(effect: StateEffect<T>, fn: (value: T) => R): R

export function mapEffectValue<T, R>(
  effect: StateEffect<T> | ((value: T) => R),
  fn?: (value: T) => R,
) {
  if (typeof effect === 'function') {
    const _fn = effect
    return (_effect: StateEffect<T>) => _fn(_effect.value)
  }
  return fn!(effect.value)
}

export function filterEffects<T>(
  effects: readonly StateEffect<unknown>[],
  type: StateEffectType<T>,
): StateEffect<T>[] {
  return effects.filter(matchEffect(type))
}
