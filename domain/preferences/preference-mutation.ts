/** Keeps an optimistic preference update recoverable when a remote save fails. */
export function rollbackPreferenceMutation<T>(previous: T | undefined): T | undefined { return previous; }
