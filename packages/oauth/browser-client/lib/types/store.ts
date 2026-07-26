import type { Did } from '@atcute/lexicons';

/** a stored value together with the revision it was written at */
export interface StoredRecord<V> {
	value: V;
	revision: number;
}

export interface SimpleStore<K extends string | number, V extends {} | null> {
	get: (key: K) => undefined | V;
	getRecord: (key: K) => undefined | StoredRecord<V>;
	getWithLapsed: (key: K) => [undefined | V, number];
	/** writes the value and returns the revision it was written at */
	set: (key: K, value: V) => number;
	delete: (key: K) => void;
	keys: () => K[];
	/** observes local and remote updates, returns an unsubscribe function */
	watch: (listener: (key: K) => void) => () => void;
}

/**
 * called when a session could not be written to persistent storage.
 *
 * @param sub subject whose session could not be persisted
 * @param cause underlying storage failure
 */
export type PersistErrorHandler = (sub: Did, cause: unknown) => void;
