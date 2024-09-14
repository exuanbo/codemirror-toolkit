import { type Options as UserEventOptions, userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'

export function noop() {
  // do nothing
}

export function setupUserEvent(options?: UserEventOptions) {
  return userEvent.setup({
    advanceTimers: vi.advanceTimersByTime,
    delay: null,
    ...options,
  })
}
