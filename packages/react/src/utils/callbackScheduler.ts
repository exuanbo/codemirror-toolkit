type CancelRequest = () => void

function safeRequestAnimationFrame(callback: () => void): CancelRequest {
  if (window.requestAnimationFrame && window.self === window.top) {
    const requestId = window.requestAnimationFrame(callback)
    return () => window.cancelAnimationFrame(requestId)
  } else {
    const timeoutId = window.setTimeout(callback)
    return () => window.clearTimeout(timeoutId)
  }
}

interface CallbackScheduler {
  request: (callback: () => void) => void
  cancel: () => void
}

export function createCallbackScheduler(): CallbackScheduler {
  let cancelLastRequest: CancelRequest | undefined
  return {
    request: callback => {
      cancelLastRequest = safeRequestAnimationFrame(() => {
        cancelLastRequest = undefined
        callback()
      })
    },
    cancel: () => {
      if (cancelLastRequest) {
        cancelLastRequest()
        cancelLastRequest = undefined
      }
    },
  }
}
