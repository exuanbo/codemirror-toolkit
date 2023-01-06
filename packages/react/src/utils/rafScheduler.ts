type CancelFrameRequest = () => void

function requestAnimationFrameWithFallback(callback: () => void): CancelFrameRequest {
  if (window.requestAnimationFrame && window.self === window.top) {
    const requestId = window.requestAnimationFrame(callback)
    return () => window.cancelAnimationFrame(requestId)
  } else {
    const timeoutId = window.setTimeout(callback)
    return () => window.clearTimeout(timeoutId)
  }
}

interface RafScheduler {
  request: (callback: () => void) => void
  cancel: () => void
}

export function createRafScheduler(): RafScheduler {
  let cancelFrameRequest: CancelFrameRequest | undefined
  return {
    request: (callback) => {
      cancelFrameRequest = requestAnimationFrameWithFallback(() => {
        cancelFrameRequest = undefined
        callback()
      })
    },
    cancel: () => {
      if (cancelFrameRequest) {
        cancelFrameRequest()
        cancelFrameRequest = undefined
      }
    },
  }
}
