/**
 * function that acquires a lock by name and runs a callback.
 */
export type LockFunction = <T>(name: string, fn: () => Promise<T>) => Promise<T>;

const locks = new Map<string, Promise<void>>();

/**
 * acquires a lock by name, ensuring only one callback runs at a time per name.
 *
 * @param name lock identifier
 * @returns release function
 */
const acquireLock = (name: string): Promise<() => void> => {
	return new Promise((resolveAcquire) => {
		const prev = locks.get(name) ?? Promise.resolve();
		const next = prev.then(() => {
			return new Promise<void>((resolveRelease) => {
				const release = () => {
					// only delete the lock if it is still the current one
					if (locks.get(name) === next) {
						locks.delete(name);
					}
					resolveRelease();
				};
				resolveAcquire(release);
			});
		});

		locks.set(name, next);
	});
};

/**
 * runs a callback with an exclusive lock by name.
 *
 * ensures only one callback runs at a time for a given lock name.
 * this is the default in-memory implementation for single-process use.
 *
 * @param name lock identifier
 * @param fn callback to run while holding the lock
 * @returns callback result
 */
export const requestLock: LockFunction = async (name, fn) => {
	const release = await acquireLock(name);
	try {
		return await fn();
	} finally {
		release();
	}
};
