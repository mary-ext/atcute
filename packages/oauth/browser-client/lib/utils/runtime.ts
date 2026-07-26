/**
 * @returns the lock manager used to serialize session mutations across documents
 * @throws {Error} if the Web Locks API is unavailable
 */
export const getLockManager = (): LockManager => {
	// resolved lazily, the module can be imported during SSR where `navigator` is absent
	const locks = globalThis.navigator?.locks as LockManager | undefined;

	if (locks === undefined) {
		throw new Error(`web locks api is unavailable, a secure context is required`);
	}

	return locks;
};
