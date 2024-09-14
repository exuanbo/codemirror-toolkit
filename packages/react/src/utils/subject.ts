type ObserverNext<T> = (value: T) => void

interface Subject<T> {
  get value(): T
  getValue: () => T
  next: (value: T) => void
  subscribe: (next: ObserverNext<T>) => () => void
}

// prettier-ignore
export function createSubject<T>(_value: T): Subject<T> {
  const observers = new Set<ObserverNext<T>>()
  return {
    get value() { return _value },
    getValue: () => _value,
    next: (value) => {
      if (_value !== value) {
        _value = value
        ;[...observers].forEach((next) => next(value))
      }
    },
    subscribe: (next) => {
      observers.add(next)
      next(_value)
      return () => observers.delete(next)
    },
  }
}
