import { getPublicKeyFromDidController, verifySig, type FoundPublicKey } from '@atcute/crypto';
import { getAtprotoVerificationMaterial, type DidDocument } from '@atcute/identity';
import { type DidDocumentResolver } from '@atcute/identity-resolver';
import type { Did, Nsid } from '@atcute/lexicons';
import * as uint8arrays from '@atcute/uint8array';

import type { Result } from '../types/misc.ts';

import { parseJwt, type ParsedJwt } from './jwt.ts';
import type { AuthError } from './types.ts';

export interface ServiceJwtVerifierOptions {
	serviceDid: Did | null;
	resolver: DidDocumentResolver;
}

export interface VerifyJwtOptions {
	lxm: Nsid | Nsid[] | null;
}

export interface VerifiedJwt {
	issuer: Did;
	audience: Did;
	lxm: string | undefined;
}

export class ServiceJwtVerifier {
	didDocResolver: DidDocumentResolver;
	serviceDid: Did | null;

	constructor(options: ServiceJwtVerifierOptions) {
		this.didDocResolver = options.resolver;
		this.serviceDid = options.serviceDid;
	}

	async #getSigningKey(issuer: Did, noCache: boolean): Promise<Result<FoundPublicKey, AuthError>> {
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

		const controller = getAtprotoVerificationMaterial(didDocument);
		if (!controller) {
			return {
				ok: false,
				error: {
					error: 'BadJwtIssuer',
					description: `${issuer} does not have an atproto verification material`,
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
					description: `${issuer} has invalid atproto verification material`,
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

	async verify(jwtString: string, options?: VerifyJwtOptions): Promise<Result<VerifiedJwt, AuthError>> {
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

		if (Date.now() / 1_000 > payload.exp) {
			return {
				ok: false,
				error: {
					error: 'JwtExpired',
					description: `jwt is expired`,
				},
			};
		}

		if (this.serviceDid !== undefined && this.serviceDid !== payload.aud) {
			return {
				ok: false,
				error: {
					error: 'BadJwtAudience',
					description: `jwt audience does not match (expected ${this.serviceDid})`,
				},
			};
		}

		if (
			options?.lxm != null &&
			(typeof options.lxm === 'string' ? options.lxm !== payload.lxm : !options.lxm.includes(payload.lxm!))
		) {
			return {
				ok: false,
				error: {
					error: `BadJwtLexiconMethod`,
					description: `jwt lexicon method does not match (expected ${options.lxm})`,
				},
			};
		}

		const key = await this.#getSigningKey(payload.iss, false);
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
			const freshKey = await this.#getSigningKey(payload.iss, true);
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
