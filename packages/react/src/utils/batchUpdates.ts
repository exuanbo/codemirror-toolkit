import { version as REACT_VERSION } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

const hasAutomaticBatching = Number.parseInt(REACT_VERSION) >= 18

function noopBatchUpdates(callback: () => void) {
  callback()
}

export const batchUpdates = hasAutomaticBatching ? noopBatchUpdates : unstable_batchedUpdates
