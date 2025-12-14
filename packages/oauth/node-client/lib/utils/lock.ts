/**
 * function that acquires a lock by name and runs a callback.
 */
export type LockFunction = <T>(name: string, fn: () => Promise<T>) => Promise<T>;
