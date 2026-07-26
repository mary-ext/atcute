import type { Did } from '@atcute/lexicons';

export interface SimpleStore<K extends string | number, V extends {} | null> {
	get: (key: K) => undefined | V;
	getWithLapsed: (key: K) => [undefined | V, number];
	set: (key: K, value: V) => void;
	delete: (key: K) => void;
	keys: () => K[];
}

/**
 * called when a session could not be written to persistent storage.
 *
 * @param sub subject whose session could not be persisted
 * @param cause underlying storage failure
 */
export type PersistErrorHandler = (sub: Did, cause: unknown) => void;
