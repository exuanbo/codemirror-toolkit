export interface ImmutableSetWrapper<T> {
  add: (value: T) => ImmutableSetWrapper<T>
  addMany: (values: T[]) => ImmutableSetWrapper<T>
  delete: (value: T) => ImmutableSetWrapper<T>
  deleteMany: (values: T[]) => ImmutableSetWrapper<T>
  clear: () => ImmutableSetWrapper<T>
  unwrap: () => Set<T>
}

export const ImmutableSetUtils = /*#__PURE__*/ Object.freeze({
  add: <T>(set: Set<T>, value: T): Set<T> => {
    if (set.has(value)) {
      return set
    }
    const newSet = new Set(set)
    newSet.add(value)
    return newSet
  },
  delete: <T>(set: Set<T>, value: T): Set<T> => {
    if (!set.has(value)) {
      return set
    }
    const newSet = new Set(set)
    newSet.delete(value)
    return newSet
  },
  clear: <T>(set: Set<T>): Set<T> => {
    if (!set.size) {
      return set
    }
    return new Set()
  },
  wrap: <T>(set: Set<T>): ImmutableSetWrapper<T> => {
    const utils = ImmutableSetUtils
    return {
      add: (value) => utils.wrap(utils.add(set, value)),
      addMany: (values) => utils.wrap(values.reduce(utils.add, set)),
      delete: (value) => utils.wrap(utils.delete(set, value)),
      deleteMany: (values) => utils.wrap(values.reduce(utils.delete, set)),
      clear: () => utils.wrap(utils.clear(set)),
      unwrap: () => set,
    }
  },
})
