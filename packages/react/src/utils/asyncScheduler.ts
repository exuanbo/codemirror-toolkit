type CancelTask = () => void

function runTask(callback: () => void): CancelTask {
  const timeoutId = window.setTimeout(callback)
  return () => window.clearTimeout(timeoutId)
}

interface AsyncScheduler {
  request: (callback: () => void) => void
  cancel: () => void
}

export function createAsyncScheduler(): AsyncScheduler {
  let cancelTask: CancelTask | undefined | null
  return {
    request: (callback) => {
      cancelTask = runTask(() => {
        cancelTask = null
        callback()
      })
    },
    cancel: () => {
      if (cancelTask) {
        cancelTask()
        cancelTask = null
      }
    },
  }
}
