// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

export function isFunction(value: unknown): value is AnyFunction {
  return typeof value === 'function'
}
