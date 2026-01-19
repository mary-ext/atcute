import { toBase64Url } from '@atcute/multibase';
import { randomBytes } from '@atcute/uint8array';

/** max age for DPoP nonces (3 minutes) */
const DPOP_NONCE_MAX_AGE = 3 * 60 * 1000;

/** rotation interval (1 minute) */
const ROTATION_INTERVAL = DPOP_NONCE_MAX_AGE / 3;

/** secret byte length */
const SECRET_BYTE_LENGTH = 32;

export type DpopSecret = string | Uint8Array<ArrayBuffer>;

/**
 * HMAC-based DPoP nonce manager.
 *
 * generates deterministic nonces based on time and a secret, allowing
 * validation without storing individual nonces. maintains a window of
 * 3 valid nonces (prev, now, next) for clock skew tolerance.
 */
export class DpopNonce {
	readonly #key: CryptoKey;
	readonly #rotationInterval: number;

	#counter: number;
	#prev: string;
	#now: string;
	#next: string;

	private constructor(key: CryptoKey, counter: number, prev: string, now: string, next: string) {
		this.#key = key;
		this.#rotationInterval = ROTATION_INTERVAL;
		this.#counter = counter;
		this.#prev = prev;
		this.#now = now;
		this.#next = next;
	}

	/**
	 * creates a new DpopNonce instance.
	 *
	 * @param secret optional secret for nonce generation. if not provided, a
	 *   random secret will be generated. use a shared secret for multi-instance
	 *   deployments.
	 * @returns promise resolving to the DpopNonce instance
	 */
	static async create(secret?: DpopSecret): Promise<DpopNonce> {
		const secretBytes = parseSecret(secret);
		const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, [
			'sign',
		]);

		const counter = getCurrentCounter(ROTATION_INTERVAL);

		// pre-compute initial nonces
		const [prev, now, next] = await Promise.all([
			computeNonce(key, counter - 1),
			computeNonce(key, counter),
			computeNonce(key, counter + 1),
		]);

		return new DpopNonce(key, counter, prev, now, next);
	}

	/**
	 * returns the next nonce to include in the DPoP-Nonce response header.
	 */
	async next(): Promise<string> {
		await this.#rotate();
		return this.#next;
	}

	/**
	 * validates a nonce from a DPoP proof.
	 *
	 * @param nonce the nonce to validate
	 * @returns true if the nonce matches prev, now, or next
	 */
	async check(nonce: string): Promise<boolean> {
		await this.#rotate();

		return nonce === this.#prev || nonce === this.#now || nonce === this.#next;
	}

	async #rotate(): Promise<void> {
		const counter = getCurrentCounter(this.#rotationInterval);
		const diff = counter - this.#counter;

		if (diff === 0) {
			return;
		}

		if (diff === 1) {
			// optimize: shift window by one
			this.#prev = this.#now;
			this.#now = this.#next;
			this.#next = await this.#compute(counter + 1);
		} else if (diff === 2) {
			// optimize: reuse #next as #prev
			this.#prev = this.#next;
			this.#now = await this.#compute(counter);
			this.#next = await this.#compute(counter + 1);
		} else {
			// all nonces outdated, recompute all
			[this.#prev, this.#now, this.#next] = await Promise.all([
				this.#compute(counter - 1),
				this.#compute(counter),
				this.#compute(counter + 1),
			]);
		}

		this.#counter = counter;
	}

	async #compute(counter: number): Promise<string> {
		return computeNonce(this.#key, counter);
	}
}

function getCurrentCounter(interval: number): number {
	return (Date.now() / interval) | 0;
}

function parseSecret(secret: DpopSecret | undefined): Uint8Array<ArrayBuffer> {
	if (secret === undefined) {
		return randomBytes(SECRET_BYTE_LENGTH);
	}

	if (secret instanceof Uint8Array) {
		if (secret.length !== SECRET_BYTE_LENGTH) {
			throw new TypeError(`secret must be exactly ${SECRET_BYTE_LENGTH} bytes`);
		}

		return secret;
	}

	if (typeof secret === 'string') {
		if (secret.length !== SECRET_BYTE_LENGTH * 2 || !/^[0-9a-f]+$/i.test(secret)) {
			throw new TypeError(`secret must be a ${SECRET_BYTE_LENGTH * 2} character hex string`);
		}
		const bytes = new Uint8Array(SECRET_BYTE_LENGTH);
		for (let i = 0; i < SECRET_BYTE_LENGTH; i++) {
			bytes[i] = parseInt(secret.slice(i * 2, i * 2 + 2), 16);
		}

		return bytes;
	}

	throw new TypeError('secret must be a Uint8Array or hex string');
}

async function computeNonce(key: CryptoKey, counter: number): Promise<string> {
	const data = new ArrayBuffer(8);
	const view = new DataView(data);
	// write counter as 64-bit big-endian (only lower 32 bits used for practical purposes)
	view.setUint32(0, 0, false);
	view.setUint32(4, counter >>> 0, false);

	const signature = await crypto.subtle.sign('HMAC', key, data);
	return toBase64Url(new Uint8Array(signature));
}
