type CancelTask = () => void

function runTask(callback: () => void): CancelTask {
  let task: typeof callback | null = callback
  queueMicrotask(() => task?.())
  return () => (task = null)
}

interface AsyncScheduler {
  request: (callback: () => void) => void
  cancel: () => void
}

export function createAsyncScheduler(): AsyncScheduler {
  let cancelTask: CancelTask | undefined
  return {
    request: (callback) => (cancelTask = runTask(callback)),
    cancel: () => cancelTask?.(),
  }
}
