interface FrameScheduler {
  request: (callback: FrameRequestCallback) => void
  cancel: () => void
}

export function createFrameScheduler(): FrameScheduler {
  let requestId: number | undefined
  return {
    request: callback => {
      requestId = window.requestAnimationFrame(timeStamp => {
        requestId = undefined
        callback(timeStamp)
      })
    },
    cancel: () => {
      if (requestId !== undefined) {
        window.cancelAnimationFrame(requestId)
        requestId = undefined
      }
    },
  }
}
