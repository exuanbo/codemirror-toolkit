export interface SetProxy<T extends {}> {
  add: (value: T) => SetProxy<T>
  addMany: (values: T[]) => SetProxy<T>
  delete: (value: T) => SetProxy<T>
  deleteMany: (values: T[]) => SetProxy<T>
  clear: () => SetProxy<T>
  unwrap: () => Set<T>
}

export const SetProxyUtils = /*#__PURE__*/ Object.freeze({
  add: <T extends {}>(proxy: SetProxy<T>, value: T): SetProxy<T> => {
    const set = proxy.unwrap()
    if (set.has(value)) {
      return proxy
    }
    set.add(value)
    return createSetProxy(set)
  },
  delete: <T extends {}>(proxy: SetProxy<T>, value: T): SetProxy<T> => {
    const set = proxy.unwrap()
    if (!set.has(value)) {
      return proxy
    }
    set.delete(value)
    return createSetProxy(set)
  },
  clear: <T extends {}>(proxy: SetProxy<T>): SetProxy<T> => {
    const set = proxy.unwrap()
    if (!set.size) {
      return proxy
    }
    set.clear()
    return createSetProxy(set)
  },
  fp: /*#__PURE__*/ Object.freeze({
    add:
      <T extends {}>(value: T) =>
      (proxy: SetProxy<T>): SetProxy<T> => {
        return SetProxyUtils.add(proxy, value)
      },
    delete:
      <T extends {}>(value: T) =>
      (proxy: SetProxy<T>): SetProxy<T> => {
        return SetProxyUtils.delete(proxy, value)
      },
  }),
})

export function createSetProxy<T extends {}>(set: Set<T> = new Set()): SetProxy<T> {
  const proxy: SetProxy<T> = {
    add: value => SetProxyUtils.add(proxy, value),
    addMany: values => values.reduce<SetProxy<T>>(SetProxyUtils.add, proxy),
    delete: value => SetProxyUtils.delete(proxy, value),
    deleteMany: values => values.reduce<SetProxy<T>>(SetProxyUtils.delete, proxy),
    clear: () => SetProxyUtils.clear(proxy),
    unwrap: () => set,
  }
  Object.freeze(proxy)
  return proxy
}
