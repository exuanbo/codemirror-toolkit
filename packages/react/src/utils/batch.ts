import { version } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

function noopBatch(callback: () => void) {
  callback()
}

export const batch = version.startsWith('18') ? noopBatch : unstable_batchedUpdates
