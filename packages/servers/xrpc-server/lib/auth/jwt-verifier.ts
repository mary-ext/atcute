import { getPublicKeyFromDidController, verifySig, type FoundPublicKey } from '@atcute/crypto';
import { getVerificationMaterial, type DidDocument } from '@atcute/identity';
import { type DidDocumentResolver } from '@atcute/identity-resolver';
import type { Did, Nsid } from '@atcute/lexicons';
import type { AtprotoAudience } from '@atcute/lexicons/syntax';
import * as uint8arrays from '@atcute/uint8array';

import type { Result } from '../types/misc.ts';

import { parseJwt, type ParsedJwt } from './jwt.ts';
import type { AuthError } from './types.ts';

/** only `#atproto` is accepted as a signing key identifier for now */
const DEFAULT_KID = '#atproto';
type SupportedKid = typeof DEFAULT_KID;

export interface ServiceJwtVerifierOptions {
	/**
	 * list of `aud` values accepted by this service; each entry is a bare DID or a DID with
	 * service fragment (e.g. `did:web:x.example#svc`), and incoming tokens must exact-match any entry.
	 *
	 * pass `null` to skip audience validation (accept any audience). an empty array rejects every
	 * audience, which is useful when a service wants to fail closed until configured.
	 */
	acceptAudiences: (Did | AtprotoAudience)[] | null;
	resolver: DidDocumentResolver;
}

export interface VerifyJwtOptions {
	lxm: Nsid | Nsid[];
}

export interface VerifiedJwt {
	issuer: Did;
	audience: Did | AtprotoAudience;
	lxm: Nsid;
}

export class ServiceJwtVerifier {
	didDocResolver: DidDocumentResolver;
	acceptAudiences: (Did | AtprotoAudience)[] | null;

	constructor(options: ServiceJwtVerifierOptions) {
		this.didDocResolver = options.resolver;
		this.acceptAudiences = options.acceptAudiences;
	}

	async #getSigningKey(
		issuer: Did,
		kid: SupportedKid,
		noCache: boolean,
	): Promise<Result<FoundPublicKey, AuthError>> {
		let didDocument: DidDocument;
		let key: FoundPublicKey;

		try {
			didDocument = await this.didDocResolver.resolve(issuer, { noCache });
		} catch {
			return {
				ok: false,
				error: {
					error: 'UnresolvedDidDocument',
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

	async verify(jwtString: string, options: VerifyJwtOptions): Promise<Result<VerifiedJwt, AuthError>> {
		const parsed = parseJwt(jwtString);
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

		if (Date.now() / 1_000 > payload.exp) {
			return {
				ok: false,
				error: {
					error: 'JwtExpired',
					description: `jwt is expired`,
				},
			};
		}

		if (this.acceptAudiences !== null && !this.acceptAudiences.includes(payload.aud)) {
			return {
				ok: false,
				error: {
					error: 'BadJwtAudience',
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

		const key = await this.#getSigningKey(payload.iss, kid, false);
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
			const freshKey = await this.#getSigningKey(payload.iss, kid, true);
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
