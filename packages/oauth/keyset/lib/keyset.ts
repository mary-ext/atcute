import type { ClientAssertionPrivateJwk, PublicJwk } from '@atcute/oauth-crypto';
import { derivePublicJwk } from '@atcute/oauth-crypto';

import type { KeySearchOptions } from './types.js';

/**
 * preferred algorithm order for signing.
 * EC algorithms first (smaller, faster), then PSS, then PKCS#1 v1.5.
 */
const PREFERRED_ALGORITHMS = [
	'ES256',
	'ES384',
	'ES512',
	'PS256',
	'PS384',
	'PS512',
	'RS256',
	'RS384',
	'RS512',
] as const;

/**
 * a collection of private keys for client authentication.
 */
export class Keyset {
	private readonly keys: readonly ClientAssertionPrivateJwk[];
	private _publicJwks: { keys: readonly PublicJwk[] } | undefined;

	/**
	 * creates a new keyset from an array of private JWKs.
	 *
	 * @param keys array of private JWKs (at least one required, each with `kid` and `alg` set)
	 * @throws if keyset is empty or contains duplicate key IDs
	 */
	constructor(keys: ClientAssertionPrivateJwk[]) {
		if (keys.length === 0) {
			throw new Error(`keyset must contain at least one key`);
		}

		// check for duplicate kids
		const kids = new Set<string>();
		for (const key of keys) {
			if (kids.has(key.kid)) {
				throw new Error(`duplicate key ID: ${key.kid}`);
			}
			kids.add(key.kid);
		}

		this.keys = Object.freeze([...keys]);
	}

	/** number of keys in the keyset */
	get size(): number {
		return this.keys.length;
	}

	/**
	 * public JWKS for serving at client metadata or jwks_uri.
	 * derived lazily on first access, then cached.
	 */
	get publicJwks(): { keys: readonly PublicJwk[] } {
		this._publicJwks ||= { keys: this.keys.map((k) => derivePublicJwk(k, k.kid, k.alg)) };
		return this._publicJwks;
	}

	/**
	 * finds the first key matching the given criteria.
	 *
	 * @param options search criteria (kid and/or alg)
	 * @returns matching key or undefined
	 */
	find(options?: KeySearchOptions): ClientAssertionPrivateJwk | undefined {
		for (const key of this.list(options)) {
			return key;
		}
		return undefined;
	}

	/**
	 * gets a key matching the given criteria.
	 *
	 * @param options search criteria (kid and/or alg)
	 * @returns matching key
	 * @throws if no matching key is found
	 */
	get(options?: KeySearchOptions): ClientAssertionPrivateJwk {
		const key = this.find(options);
		if (!key) {
			const desc = options?.kid ?? options?.alg ?? 'any';
			throw new Error(`no key found matching: ${desc}`);
		}
		return key;
	}

	/**
	 * iterates over keys matching the given criteria, in preference order.
	 *
	 * @param options search criteria (kid and/or alg)
	 */
	*list(options?: KeySearchOptions): Generator<ClientAssertionPrivateJwk> {
		const { kid, alg } = options ?? {};
		const algSet = alg == null ? null : new Set(Array.isArray(alg) ? alg : [alg]);

		// sort keys by algorithm preference
		const sorted = this.keys.toSorted((a, b) => {
			const aIdx = PREFERRED_ALGORITHMS.indexOf(a.alg as (typeof PREFERRED_ALGORITHMS)[number]);
			const bIdx = PREFERRED_ALGORITHMS.indexOf(b.alg as (typeof PREFERRED_ALGORITHMS)[number]);
			return aIdx - bIdx;
		});

		for (const key of sorted) {
			if (kid != null && key.kid !== kid) {
				continue;
			}
			if (algSet != null && !algSet.has(key.alg)) {
				continue;
			}
			yield key;
		}
	}

	/**
	 * finds a key for signing, negotiating algorithm with server's supported list.
	 *
	 * @param serverAlgs algorithms supported by the server (from metadata)
	 * @returns key and negotiated algorithm
	 * @throws if no compatible key is found
	 */
	findForSigning(serverAlgs?: readonly string[]): { key: ClientAssertionPrivateJwk; alg: string } {
		// if server doesn't specify, default to ES256 per atproto spec
		const algs = serverAlgs ?? ['ES256'];

		const key = this.find({ alg: algs });
		if (!key) {
			throw new Error(`no key found compatible with server algorithms: ${algs.join(', ')}`);
		}

		return { key, alg: key.alg };
	}

	[Symbol.iterator](): Iterator<ClientAssertionPrivateJwk> {
		return this.keys[Symbol.iterator]();
	}
}
