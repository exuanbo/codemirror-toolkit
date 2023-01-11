type CancelImmediateTimeout = () => void

function requestImmediateTimeout(callback: () => void): CancelImmediateTimeout {
  const timeoutId = window.setTimeout(callback)
  return () => window.clearTimeout(timeoutId)
}

interface CallbackScheduler {
  request: (callback: () => void) => void
  cancel: () => void
}

export function createCallbackScheduler(): CallbackScheduler {
  let cancelTimeout: CancelImmediateTimeout | undefined
  return {
    request: (callback) => {
      cancelTimeout = requestImmediateTimeout(() => {
        cancelTimeout = undefined
        callback()
      })
    },
    cancel: () => {
      if (cancelTimeout) {
        cancelTimeout()
        cancelTimeout = undefined
      }
    },
  }
}
