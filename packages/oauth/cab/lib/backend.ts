import {
	type DpopClaims,
	DpopVerifyError,
	type DpopVerifyResult,
	type PublicJwk,
	createClientAssertion,
	verifyDpopProof,
} from '@atcute/oauth-crypto';
import type { Keyset } from '@atcute/oauth-keyset';
import { CLIENT_ASSERTION_TYPE_JWT_BEARER, oauthIssuerIdentifierSchema } from '@atcute/oauth-types';

import * as v from 'valibot';

type Awaitable<T> = PromiseLike<T> | T;

/** issues and validates the DPoP nonces used by the backend's optional challenge handshake. */
export interface DpopNonceProvider {
	/**
	 * issues a fresh nonce for a 401 challenge, bound to the proof's key thumbprint.
	 *
	 * @param ctx the verified DPoP key thumbprint
	 * @returns the nonce value to return in the `DPoP-Nonce` header
	 */
	create(ctx: { jkt: string }): Awaitable<string>;
	/**
	 * validates and consumes a presented nonce. prefer single-use semantics for real replay protection; an
	 * async (shared-storage) implementation must perform the lookup-and-consume atomically.
	 *
	 * @param nonce the nonce presented inside the DPoP proof
	 * @param ctx the verified DPoP key thumbprint
	 * @returns whether the nonce is valid
	 */
	consume(nonce: string, ctx: { jkt: string }): Awaitable<boolean>;
}

/** configuration for a {@link ClientAssertionBackend}. */
export interface ClientAssertionBackendOptions {
	/** the client_id (URL to the client metadata document); used as the assertion `iss` and `sub`. */
	clientId: string;
	/**
	 * canonical public URL of this endpoint, used as the DPoP `htu` (origin + pathname). must not contain a
	 * query or fragment.
	 */
	endpoint: string | URL;
	/** signing keys; their public halves must be advertised in the client metadata `jwks`. */
	keyset: Keyset;
	/** maximum DPoP `iat` clock skew, in seconds. defaults to 60. */
	maxClockSkew?: number;
	/** optional DPoP nonce provider. when set, a valid nonce is required. */
	nonces?: DpopNonceProvider;
	/** signing algorithm preference. defaults to `['ES256']`. */
	signingAlgs?: readonly string[];
}

/** a successfully verified DPoP proof. */
export interface VerifiedDpop {
	/** the DPoP proof claims. */
	claims: DpopClaims;
	/** the DPoP key thumbprint (RFC 7638), used as the assertion `cnf.jkt`. */
	jkt: string;
	/** the DPoP public key. */
	jwk: PublicJwk;
}

/** the outcome of verifying an inbound DPoP proof. */
export type VerifyResult =
	| { ok: true; verified: VerifiedDpop }
	| { ok: false; reason: 'expired' | 'invalid' | 'missing' }
	| { ok: false; nonce: string; reason: 'nonce_required' };

/** a minted client assertion. */
export interface IssuedAssertion {
	/** the signed client assertion JWT. */
	clientAssertion: string;
	/** the RFC 7523 client assertion type. */
	clientAssertionType: typeof CLIENT_ASSERTION_TYPE_JWT_BEARER;
	/** the client_id. */
	clientId: string;
	/** the assertion lifetime, in seconds. */
	expiresIn: number;
}

/**
 * checks whether a value is a syntactically valid authorization server issuer identifier (the audience a
 * client assertion is minted for).
 *
 * @param aud the audience to validate
 * @returns whether it is a valid issuer identifier
 */
export const isValidAud = (aud: string): boolean => {
	return v.is(oauthIssuerIdentifierSchema, aud);
};

/**
 * a client assertion backend (Bluesky OAuth proposal 0010). verifies inbound DPoP proofs from a browser-based
 * client and mints DPoP-bound client assertions (RFC 7523) signed with the client's private keys, upgrading
 * the client from public to confidential.
 */
export class ClientAssertionBackend {
	#clientId: string;
	#htu: string;
	#keyset: Keyset;
	#maxClockSkew: number | undefined;
	#nonces: DpopNonceProvider | undefined;
	#signingAlgs: readonly string[] | undefined;

	/**
	 * @param options backend configuration
	 * @throws if `endpoint` contains a query or fragment
	 */
	constructor(options: ClientAssertionBackendOptions) {
		const url = new URL(options.endpoint);
		if (url.search !== '' || url.hash !== '') {
			throw new Error(`endpoint must not contain a query or fragment`);
		}

		this.#clientId = options.clientId;
		this.#htu = url.origin + url.pathname;
		this.#keyset = options.keyset;
		this.#maxClockSkew = options.maxClockSkew;
		this.#nonces = options.nonces;
		this.#signingAlgs = options.signingAlgs;
	}

	/**
	 * verifies an inbound DPoP proof against the configured endpoint. the proof's own nonce, if any, is read
	 * from its claims — there is no separate nonce parameter.
	 *
	 * @param input the DPoP proof header value
	 * @returns a result describing the outcome
	 * @throws if verification fails unexpectedly (i.e. not a DPoP verification error)
	 */
	async verify(input: { dpopProof: string | null | undefined }): Promise<VerifyResult> {
		let result: DpopVerifyResult;
		try {
			result = await verifyDpopProof(input.dpopProof, {
				method: 'POST',
				url: this.#htu,
				maxClockSkew: this.#maxClockSkew,
			});
		} catch (err) {
			if (err instanceof DpopVerifyError) {
				switch (err.code) {
					case 'expired':
					case 'invalid': {
						return { ok: false, reason: err.code };
					}
					case 'missing': {
						return { ok: false, reason: 'missing' };
					}
				}
				// 'nonce_required' cannot occur: we never pass the nonce option to verifyDpopProof. if it
				// somehow does, rethrow rather than silently relabel it.
			}

			throw err;
		}

		const { claims, jkt, jwk } = result;

		if (this.#nonces !== undefined) {
			const presented = claims.nonce;
			if (presented === undefined || !(await this.#nonces.consume(presented, { jkt }))) {
				const nonce = await this.#nonces.create({ jkt });
				return { ok: false, nonce, reason: 'nonce_required' };
			}
		}

		return { ok: true, verified: { claims, jkt, jwk } };
	}

	/**
	 * mints a DPoP-bound client assertion for an already-verified proof.
	 *
	 * @param verified the verified DPoP proof from {@link verify}
	 * @param options the target audience (authorization server issuer)
	 * @returns the minted assertion
	 * @throws if `aud` is not a valid issuer identifier, or on signing failure
	 */
	async issue(verified: VerifiedDpop, options: { aud: string }): Promise<IssuedAssertion> {
		const { aud } = options;
		if (!isValidAud(aud)) {
			throw new TypeError(`invalid aud: not a valid issuer identifier`);
		}

		const { key } = this.#keyset.findForSigning(this.#signingAlgs);
		const clientAssertion = await createClientAssertion({
			aud,
			client_id: this.#clientId,
			jkt: verified.jkt,
			key,
		});

		return {
			clientAssertion,
			clientAssertionType: CLIENT_ASSERTION_TYPE_JWT_BEARER,
			clientId: this.#clientId,
			// mirrors the fixed lifetime baked into createClientAssertion (exp = iat + 60)
			expiresIn: 60,
		};
	}
}
