type CancelImmediateTimeout = () => void

function requestImmediateTimeout(callback: () => void): CancelImmediateTimeout {
  const timeoutId = window.setTimeout(callback)
  return () => window.clearTimeout(timeoutId)
}

interface AsyncScheduler {
  request: (callback: () => void) => void
  cancel: () => void
}

export function createAsyncScheduler(): AsyncScheduler {
  let cancelTimeout: CancelImmediateTimeout | undefined | null
  return {
    request: (callback) => {
      cancelTimeout = requestImmediateTimeout(() => {
        cancelTimeout = null
        callback()
      })
    },
    cancel: () => {
      if (cancelTimeout) {
        cancelTimeout()
        cancelTimeout = null
      }
    },
  }
}
