interface Scheduler {
  request: (callback: () => void) => void
  idle: () => boolean
}

export function createScheduler(): Scheduler {
  let task: [] | [() => void] = []
  return {
    request: (callback) => {
      if (!task.length) {
        queueMicrotask(() => task.shift()!())
      }
      task = [callback]
    },
    idle: () => !task.length,
  }
}
