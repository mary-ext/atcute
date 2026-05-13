import { getPublicKeyFromDidController, verifySig, type FoundPublicKey } from '@atcute/crypto';
import { getVerificationMaterial, type DidDocument } from '@atcute/identity';
import { type DidDocumentResolver } from '@atcute/identity-resolver';
import type { Did, Nsid } from '@atcute/lexicons';
import type { AtprotoAudience } from '@atcute/lexicons/syntax';
import * as uint8arrays from '@atcute/uint8array';

import { AuthRequiredError } from '../main/xrpc-error.ts';
import type { Result } from '../types/misc.ts';

import { parseJwt, type ParsedJwt } from './jwt.ts';
import type { AuthError } from './types.ts';

type SupportedKid = `#${string}`;
/** only `#atproto` is accepted as a signing key identifier for now */
const DEFAULT_KID: SupportedKid = '#atproto';

/**
 * replay-protection store for service JWTs. when configured on a verifier, tokens must carry a `jti` claim
 * and the verifier consults this store to reject duplicates.
 */
export interface ReplayStore {
	/**
	 * record a `(iss, jti)` pair seen now.
	 *
	 * @param key issuer + token identifier; implementations decide how to encode this into a storage key.
	 * @param ttlSeconds how long the entry must be retained. implementations are free to retain it for longer.
	 * @returns `true` if the pair was previously unseen (token is unique), `false` if the pair has been
	 *   recorded before (replay).
	 */
	check(key: { iss: Did; jti: string }, ttlSeconds: number): Promise<boolean>;
}

export interface ServiceJwtVerifierOptions {
	/**
	 * list of `aud` values accepted by this service; each entry is a bare DID or a DID with service fragment
	 * (e.g. `did:web:x.example#svc`), and incoming tokens must exact-match any entry.
	 *
	 * pass `null` to skip audience validation (accept any audience). an empty array rejects every audience,
	 * which is useful when a service wants to fail closed until configured.
	 */
	acceptAudiences: (Did | AtprotoAudience)[] | null;
	resolver: DidDocumentResolver;
	/**
	 * maximum token lifetime window in seconds. rejects tokens whose `exp` is more than this far in the future
	 * or whose `iat` is more than this far in the past. defaults to 300 (5 minutes), matching atproto
	 * convention.
	 */
	maxAge?: number;
	/** clock-skew leeway in seconds applied to `exp` and `nbf` comparisons. defaults to 5 seconds. */
	clockLeeway?: number;
	/**
	 * optional replay-protection store. when provided, tokens must carry a `jti` claim and the verifier rejects
	 * any `(iss, jti)` the store reports as previously seen.
	 */
	replayStore?: ReplayStore;
}

export interface VerifyJwtOptions {
	lxm: Nsid | Nsid[];
	/** abort signal forwarded to DID resolution; falls back to `request.signal` in `verifyRequest`. */
	signal?: AbortSignal;
}

export interface VerifiedJwt {
	issuer: Did;
	audience: Did | AtprotoAudience;
	lxm: Nsid;
}

const BEARER_PREFIX = 'Bearer ';

export class ServiceJwtVerifier {
	didDocResolver: DidDocumentResolver;
	acceptAudiences: (Did | AtprotoAudience)[] | null;
	maxAge: number;
	clockLeeway: number;
	replayStore?: ReplayStore;

	constructor(options: ServiceJwtVerifierOptions) {
		this.didDocResolver = options.resolver;
		this.acceptAudiences = options.acceptAudiences;
		this.maxAge = options.maxAge ?? 5 * 60;
		this.clockLeeway = options.clockLeeway ?? 5;
		this.replayStore = options.replayStore;
	}

	/**
	 * parse the Authorization header, verify the bearer token, and return the validated claims. throws
	 * {@link AuthRequiredError} with a populated `WWW-Authenticate: Bearer` challenge on every failure path.
	 *
	 * @param request incoming request; `request.signal` is forwarded to DID resolution unless `options.signal`
	 *   overrides it.
	 * @param options verification options; `lxm` restricts which lexicon methods the token is allowed to
	 *   invoke.
	 * @throws {AuthRequiredError} on missing header, malformed token, signature mismatch, audience/lxm
	 *   rejection, replay, or expiry.
	 */
	async verifyRequest(request: Request, options: VerifyJwtOptions): Promise<VerifiedJwt> {
		const authorization = request.headers.get('authorization');
		if (authorization === null) {
			throw new AuthRequiredError({
				message: 'authorization header required',
				wwwAuthenticate: { scheme: 'Bearer' },
			});
		}

		if (!authorization.startsWith(BEARER_PREFIX)) {
			throw authError({ error: 'MissingBearer', description: 'expected a bearer token' });
		}

		const token = authorization.slice(BEARER_PREFIX.length).trim();
		const signal = options.signal ?? request.signal;

		const result = await this.#verifyToken(token, { lxm: options.lxm, signal });
		if (!result.ok) {
			throw authError(result.error);
		}

		return result.value;
	}

	async #getSigningKey(
		issuer: Did,
		kid: SupportedKid,
		noCache: boolean,
		signal: AbortSignal,
	): Promise<Result<FoundPublicKey, AuthError>> {
		let didDocument: DidDocument;
		let key: FoundPublicKey;

		try {
			didDocument = await this.didDocResolver.resolve(issuer, { noCache, signal });
		} catch {
			return {
				ok: false,
				error: {
					error: 'DidResolutionFailed',
					description: `failed to retrieve did document for ${issuer}`,
				},
			};
		}

		const controller = getVerificationMaterial(didDocument, kid);
		if (!controller) {
			return {
				ok: false,
				error: {
					error: 'BadJwtIssuer',
					description: `${issuer} does not have a ${kid} verification material`,
				},
			};
		}

		try {
			key = getPublicKeyFromDidController(controller);
		} catch {
			return {
				ok: false,
				error: {
					error: 'BadJwtIssuer',
					description: `${issuer} has invalid ${kid} verification material`,
				},
			};
		}

		return { ok: true, value: key };
	}

	async #verifySignature(key: FoundPublicKey, jwt: ParsedJwt): Promise<Result<boolean, AuthError>> {
		try {
			return {
				ok: true,
				value: await verifySig(key, jwt.signature, jwt.message, { allowMalleableSig: true }),
			};
		} catch {
			return {
				ok: false,
				error: {
					error: 'BadJwtSignature',
					description: `could not verify jwt signature`,
				},
			};
		}
	}

	async #verifyToken(
		token: string,
		options: { lxm: Nsid | Nsid[]; signal: AbortSignal },
	): Promise<Result<VerifiedJwt, AuthError>> {
		const parsed = parseJwt(token);
		if (!parsed.ok) {
			return parsed;
		}

		const { header, payload } = parsed.value;

		switch (header.typ) {
			case 'at+jwt':
			case 'refresh+jwt':
			case 'dpop+jwt': {
				return {
					ok: false,
					error: {
						error: 'BadJwtType',
						description: `invalid jwt type`,
					},
				};
			}
		}

		// resolve the `kid` header (defaulting to `#atproto`) and restrict to the set of
		// identifiers this verifier knows how to look up in the issuer's DID document.
		// matches proposal 0014's "safe default" for SDKs.
		const kid: string = header.kid ?? DEFAULT_KID;
		if (kid !== DEFAULT_KID) {
			return {
				ok: false,
				error: {
					error: 'BadJwtIssuer',
					description: `unsupported signing key identifier (${kid})`,
				},
			};
		}

		const now = Math.floor(Date.now() / 1_000);

		if (payload.nbf !== undefined && now < payload.nbf - this.clockLeeway) {
			return {
				ok: false,
				error: {
					error: 'JwtNotYetValid',
					description: `jwt is not yet valid`,
				},
			};
		}

		if (now > payload.exp + this.clockLeeway) {
			return {
				ok: false,
				error: {
					error: 'JwtExpired',
					description: `jwt is expired`,
				},
			};
		}

		// prevent issuers from minting very long-lived tokens: the configured max-age
		// window bounds how far `exp` can be in the future and how far `iat` can be in
		// the past.
		if (payload.exp - now > this.maxAge || (payload.iat !== undefined && now - payload.iat > this.maxAge)) {
			return {
				ok: false,
				error: {
					error: 'JwtTooOld',
					description: `jwt exceeds maximum age (${this.maxAge}s)`,
				},
			};
		}

		if (this.acceptAudiences !== null && !this.acceptAudiences.includes(payload.aud)) {
			return {
				ok: false,
				error: {
					error: 'InvalidAudience',
					description:
						this.acceptAudiences.length === 0
							? `jwt audience does not match (no audiences accepted)`
							: `jwt audience does not match (expected one of: ${this.acceptAudiences.join(', ')})`,
				},
			};
		}

		if (typeof options.lxm === 'string' ? options.lxm !== payload.lxm : !options.lxm.includes(payload.lxm)) {
			return {
				ok: false,
				error: {
					error: `BadJwtLexiconMethod`,
					description: `jwt lexicon method does not match (expected ${options.lxm})`,
				},
			};
		}

		let jti: string | undefined;
		if (this.replayStore !== undefined) {
			if (payload.jti === undefined) {
				return {
					ok: false,
					error: {
						error: 'BadJwt',
						description: `jwt is missing the jti claim (required for replay protection)`,
					},
				};
			}

			jti = payload.jti;
		}

		const key = await this.#getSigningKey(payload.iss, kid, false, options.signal);
		if (!key.ok) {
			return key;
		}

		let isValid = false;

		if (key.value.jwtAlg === header.alg) {
			const result = await this.#verifySignature(key.value, parsed.value);
			if (!result.ok) {
				return result;
			}

			isValid = result.value;
		}

		if (!isValid) {
			// try again, uncached
			const freshKey = await this.#getSigningKey(payload.iss, kid, true, options.signal);
			if (!freshKey.ok) {
				return freshKey;
			}

			// at this point we can't ignore the jwt alg difference
			if (freshKey.value.jwtAlg !== header.alg) {
				return {
					ok: false,
					error: {
						error: 'BadJwtIssuer',
						description: `mismatching cryptographic key format (jwt is ${header.alg})`,
					},
				};
			}

			// only revalidate if it's a different key
			if (!uint8arrays.equals(freshKey.value.publicKeyBytes, key.value.publicKeyBytes)) {
				const result = await this.#verifySignature(freshKey.value, parsed.value);
				if (!result.ok) {
					return result;
				}

				isValid = result.value;
			}
		}

		if (!isValid) {
			// too bad
			return {
				ok: false,
				error: {
					error: 'BadJwtSignature',
					description: `invalid jwt signature`,
				},
			};
		}

		// replay-store check runs after signature verification so forged tokens
		// can't burn entries (memory dos) or evict legitimate `(iss, jti)` pairs
		// before the real request lands.
		if (this.replayStore !== undefined && jti !== undefined) {
			const unique = await this.replayStore.check({ iss: payload.iss, jti }, this.maxAge);
			if (!unique) {
				return {
					ok: false,
					error: {
						error: 'NonceNotUnique',
						description: `jwt has been used before`,
					},
				};
			}
		}

		return {
			ok: true,
			value: {
				issuer: payload.iss,
				audience: payload.aud,
				lxm: payload.lxm,
			},
		};
	}
}

const authError = (err: AuthError): AuthRequiredError => {
	return new AuthRequiredError({
		message: err.description,
		wwwAuthenticate: { scheme: 'Bearer', params: { error: err.error } },
	});
};
