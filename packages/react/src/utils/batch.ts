import { version as REACT_VERSION } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

function noopBatch(callback: () => void) {
  callback()
}

export const batch = REACT_VERSION.startsWith('18') ? noopBatch : unstable_batchedUpdates
