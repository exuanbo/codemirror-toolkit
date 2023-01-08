import userEvent from '@testing-library/user-event'
import type { Options as UserEventOptions } from '@testing-library/user-event/options'
import { vi } from 'vitest'

export function noop() {
  // do nothing
}

export function setupUserEvent(options?: UserEventOptions) {
  return userEvent.setup({
    advanceTimers: (delay) => vi.advanceTimersByTime(delay),
    ...options,
  })
}
