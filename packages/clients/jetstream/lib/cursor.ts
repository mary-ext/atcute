export interface CursorStore {
	/** @returns the saved sequence, or `undefined` for the live tip */
	load(): number | undefined | PromiseLike<number | undefined>;
	/**
	 * @param seq sequence to save
	 * @throws if storage fails
	 */
	save(seq: number): void | PromiseLike<void>;
}

/**
 * creates an in-memory cursor store.
 *
 * @param initialSeq initial sequence
 * @returns a cursor store
 */
export const memoryCursorStore = (initialSeq?: number): CursorStore => {
	let seq = initialSeq;

	return {
		load() {
			return seq;
		},
		save(next) {
			seq = next;
		},
	};
};
