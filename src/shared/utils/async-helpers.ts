/**
 * Utility functions for handling async operations with timeouts
 */

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    ),
  ]);
}

export function createSafetyTimeout(
  callback: () => void,
  timeoutMs: number = 10000
): NodeJS.Timeout {
  return setTimeout(callback, timeoutMs);
}
