export const locks: LockManager | undefined = typeof navigator !== 'undefined' ? navigator.locks : undefined;
