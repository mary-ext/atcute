import { fromBase64Url } from '@atcute/multibase';
import { decodeUtf8From } from '@atcute/uint8array';

import * as v from '@badrap/valita';

import { getImportAlgorithm } from '../internal/crypto.js';
import { computeJktFromJwk } from '../jwk/compute-jkt.js';
import type { PublicJwk, SigningAlgorithm } from '../jwk/types.js';
import { verifyJwt } from '../jwt/index.js';

import type { Awaitable } from './types.js';

const dpopJwkSchema = v.union(
	v.object({
		kty: v.literal('EC'),
		crv: v.union(v.literal('P-256'), v.literal('P-384'), v.literal('P-521')),
		x: v.string(),
		y: v.string(),
	}),
	v.object({
		kty: v.literal('RSA'),
		e: v.string(),
		n: v.string(),
	}),
);

const dpopHeaderSchema = v.object({
	typ: v.literal('dpop+jwt'),
	alg: v.string().assert((alg) => alg !== 'none', 'alg must not be "none"'),
	jwk: dpopJwkSchema,
});

const dpopPayloadSchema = v.object({
	htm: v.string(),
	htu: v.string(),
	iat: v.number(),
	jti: v.string(),
	nonce: v.string().optional(),
});

export type DpopClaims = v.Infer<typeof dpopPayloadSchema>;
type DpopJwk = v.Infer<typeof dpopJwkSchema>;

export interface DpopVerifyResult {
	claims: DpopClaims;
	jkt: string;
	jwk: PublicJwk;
}

export interface DpopVerifyOptions {
	method: string;
	url: string;
	nonce?: { check(nonce: string): Awaitable<boolean> };
	maxClockSkew?: number;
}

/**
 * error thrown when dpop verification fails.
 */
export class DpopVerifyError extends Error {
	constructor(
		message: string,
		public code: 'missing' | 'invalid' | 'expired' | 'nonce_required',
	) {
		super(message);
		this.name = 'DpopVerifyError';
	}
}

/**
 * verifies a dpop proof from a request header.
 *
 * @param dpopHeader dpop header value
 * @param options verification options
 * @returns verification result with claims and jwk thumbprint
 * @throws {DpopVerifyError} if verification fails
 */
export const verifyDpopProof = async (
	dpopHeader: string | null | undefined,
	options: DpopVerifyOptions,
): Promise<DpopVerifyResult> => {
	if (!dpopHeader) {
		throw new DpopVerifyError(`missing dpop header`, 'missing');
	}

	const { method, url, nonce: dpopNonce, maxClockSkew = 60 } = options;
	const parts = dpopHeader.split('.');
	if (parts.length !== 3) {
		throw new DpopVerifyError(`invalid dpop proof format`, 'invalid');
	}

	let header: v.Infer<typeof dpopHeaderSchema>;
	try {
		header = dpopHeaderSchema.parse(decodeSegment(parts[0]), { mode: 'passthrough' });
	} catch {
		throw new DpopVerifyError(`invalid dpop header`, 'invalid');
	}

	const { jwk, alg } = header;
	if (!isSigningAlgorithm(alg)) {
		throw new DpopVerifyError(`unsupported dpop alg`, 'invalid');
	}

	let payload: DpopClaims;
	try {
		const key = await importPublicKey(jwk, alg);
		const raw = await verifyJwt(dpopHeader, { key, alg, typ: 'dpop+jwt' });
		payload = dpopPayloadSchema.parse(raw, { mode: 'passthrough' });
	} catch (err) {
		if (err instanceof v.ValitaError) {
			throw new DpopVerifyError(`invalid dpop payload`, 'invalid');
		}
		throw new DpopVerifyError(`dpop signature verification failed`, 'invalid');
	}

	if (payload.htm !== method) {
		throw new DpopVerifyError(`dpop htm mismatch: expected ${method}, got ${payload.htm}`, 'invalid');
	}
	if (payload.htu !== url) {
		throw new DpopVerifyError(`dpop htu mismatch: expected ${url}, got ${payload.htu}`, 'invalid');
	}

	const now = Math.floor(Date.now() / 1000);
	if (payload.iat > now + maxClockSkew) {
		throw new DpopVerifyError(`dpop proof issued in the future`, 'invalid');
	}
	if (payload.iat < now - maxClockSkew) {
		throw new DpopVerifyError(`dpop proof expired`, 'expired');
	}

	if (dpopNonce) {
		if (!payload.nonce || !(await dpopNonce.check(payload.nonce))) {
			throw new DpopVerifyError(`invalid or missing dpop nonce`, 'nonce_required');
		}
	}

	const jkt = await computeJktFromJwk(jwk as PublicJwk);

	return { claims: payload, jwk: jwk as DpopJwk, jkt };
};

const importPublicKey = async (jwk: PublicJwk, alg: SigningAlgorithm): Promise<CryptoKey> => {
	const algorithm = getImportAlgorithm(alg, jwk.kty === 'EC' ? jwk.crv : undefined);
	const key = await crypto.subtle.importKey('jwk', jwk, algorithm, true, ['verify']);
	if (!(key instanceof CryptoKey)) {
		throw new Error(`expected asymmetric key, got symmetric`);
	}

	return key;
};

const isSigningAlgorithm = (alg: string): alg is SigningAlgorithm => {
	return (
		alg === 'ES256' ||
		alg === 'ES384' ||
		alg === 'ES512' ||
		alg === 'PS256' ||
		alg === 'PS384' ||
		alg === 'PS512' ||
		alg === 'RS256' ||
		alg === 'RS384' ||
		alg === 'RS512'
	);
};

const decodeSegment = (segment: string): unknown => {
	const bytes = fromBase64Url(segment);
	return JSON.parse(decodeUtf8From(bytes));
};
