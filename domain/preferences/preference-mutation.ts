/** Keeps an optimistic preference update recoverable when a remote save fails. */
export function rollbackPreferenceMutation<T>(previous: T | undefined): T | undefined { return previous; }

/** Merge screen-local edits into the latest canonical object before persistence. */
export function mergePreferenceMutation<T extends object>(
  current: T,
  changes: Partial<T>,
): T {
  return { ...current, ...changes };
}
