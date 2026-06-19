import { nanoid } from 'nanoid';

import type { DpopNonceProvider } from './backend.ts';

/** options for {@link MemoryDpopNonceProvider}. */
export interface MemoryDpopNonceProviderOptions {
	/** nonce lifetime, in seconds. defaults to 300. */
	ttl?: number;
}

interface NonceRecord {
	expiresAt: number;
	jkt: string;
}

/** the map size past which {@link MemoryDpopNonceProvider} opportunistically prunes expired nonces. */
const PRUNE_THRESHOLD = 256;

/**
 * an in-memory {@link DpopNonceProvider} with single-use, `jkt`-bound nonces.
 *
 * single-process only: it holds nonces in a local map and shares no state across instances, so it is
 * unsuitable for a load-balanced deployment — provide a shared-storage implementation there. live memory is
 * bounded by `ttl` × the create rate, not by {@link PRUNE_THRESHOLD}, so a flood of never-completed
 * challenges can grow the map up to one `ttl` window's worth of nonces.
 */
export class MemoryDpopNonceProvider implements DpopNonceProvider {
	#nextPruneAt = 0;
	#store = new Map<string, NonceRecord>();
	#ttl: number;

	constructor(options?: MemoryDpopNonceProviderOptions) {
		this.#ttl = (options?.ttl ?? 300) * 1000;
	}

	create(ctx: { jkt: string }): string {
		this.#prune();

		const nonce = nanoid(24);
		this.#store.set(nonce, { expiresAt: Date.now() + this.#ttl, jkt: ctx.jkt });
		return nonce;
	}

	consume(nonce: string, ctx: { jkt: string }): boolean {
		const record = this.#store.get(nonce);
		if (record === undefined) {
			return false;
		}

		// single-use: a nonce is spent on first lookup, whether or not it turns out valid
		this.#store.delete(nonce);
		return record.expiresAt >= Date.now() && record.jkt === ctx.jkt;
	}

	#prune(): void {
		const now = Date.now();
		if (this.#store.size < PRUNE_THRESHOLD || now < this.#nextPruneAt) {
			return;
		}

		this.#nextPruneAt = now + this.#ttl;
		for (const [nonce, record] of this.#store) {
			if (record.expiresAt < now) {
				this.#store.delete(nonce);
			}
		}
	}
}
