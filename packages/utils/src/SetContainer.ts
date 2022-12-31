export interface SetContainer<T extends {}> {
  add: (value: T) => SetContainer<T>
  addMany: (values: T[]) => SetContainer<T>
  delete: (value: T) => SetContainer<T>
  deleteMany: (values: T[]) => SetContainer<T>
  clear: () => SetContainer<T>
  extract: () => Set<T>
}

export const SetContainerUtils = /*#__PURE__*/ Object.freeze({
  add: <T extends {}>(container: SetContainer<T>, value: T): SetContainer<T> => {
    const set = container.extract()
    if (set.has(value)) {
      return container
    }
    set.add(value)
    return createSetContainer(set)
  },
  delete: <T extends {}>(container: SetContainer<T>, value: T): SetContainer<T> => {
    const set = container.extract()
    if (!set.has(value)) {
      return container
    }
    set.delete(value)
    return createSetContainer(set)
  },
  clear: <T extends {}>(container: SetContainer<T>): SetContainer<T> => {
    const set = container.extract()
    if (!set.size) {
      return container
    }
    set.clear()
    return createSetContainer(set)
  },
  fp: /*#__PURE__*/ Object.freeze({
    add:
      <T extends {}>(value: T) =>
      (container: SetContainer<T>): SetContainer<T> => {
        return SetContainerUtils.add(container, value)
      },
    delete:
      <T extends {}>(value: T) =>
      (container: SetContainer<T>): SetContainer<T> => {
        return SetContainerUtils.delete(container, value)
      },
  }),
})

export function createSetContainer<T extends {}>(set: Set<T> = new Set()): SetContainer<T> {
  const container: SetContainer<T> = {
    add: value => SetContainerUtils.add(container, value),
    addMany: values => values.reduce<SetContainer<T>>(SetContainerUtils.add, container),
    delete: value => SetContainerUtils.delete(container, value),
    deleteMany: values => values.reduce<SetContainer<T>>(SetContainerUtils.delete, container),
    clear: () => SetContainerUtils.clear(container),
    extract: () => set,
  }
  Object.freeze(container)
  return container
}
