import * as v from '@badrap/valita';
import { fromBase64Url, toBase64Url } from '@atcute/multibase';
import { decodeUtf8From, encodeUtf8, toSha256 } from '@atcute/uint8array';
import { importJWK, jwtVerify } from 'jose';

import type { DpopNonce } from './dpop-nonce.js';

// #region schemas

const jwkEcSchema = v.object({
	kty: v.literal('EC'),
	crv: v.union(v.literal('P-256'), v.literal('P-384'), v.literal('P-521')),
	x: v.string(),
	y: v.string(),
});

const jwkRsaSchema = v.object({
	kty: v.literal('RSA'),
	e: v.string(),
	n: v.string(),
});

const jwkOkpSchema = v.object({
	kty: v.literal('OKP'),
	crv: v.union(v.literal('Ed25519'), v.literal('Ed448')),
	x: v.string(),
});

const dpopJwkSchema = v.union(jwkEcSchema, jwkRsaSchema, jwkOkpSchema);

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

// #endregion

export type DPoPJwk = v.Infer<typeof dpopJwkSchema>;
export type DPoPClaims = v.Infer<typeof dpopPayloadSchema>;

/**
 * result of successful DPoP verification
 */
export interface DPoPVerifyResult {
	/** the verified claims */
	claims: DPoPClaims;
	/** JWK thumbprint (base64url-encoded SHA-256 of canonical JWK) */
	jkt: string;
	/** the public JWK from the proof */
	jwk: DPoPJwk;
}

/**
 * options for DPoP verification
 */
export interface DPoPVerifyOptions {
	/** expected HTTP method (e.g., 'POST') */
	method: string;
	/** expected HTTP target URI (origin + pathname) */
	url: string;
	/** optional nonce manager for validation */
	nonce?: DpopNonce;
	/** maximum allowed clock skew in seconds (default: 60) */
	maxClockSkew?: number;
}

/**
 * error thrown when DPoP verification fails
 */
export class DPoPVerifyError extends Error {
	constructor(
		message: string,
		public code: 'missing' | 'invalid' | 'expired' | 'nonce_required',
	) {
		super(message);
		this.name = 'DPoPVerifyError';
	}
}

/**
 * computes the JWK thumbprint (RFC 7638) for a public key.
 *
 * @param jwk the public JWK
 * @returns base64url-encoded SHA-256 thumbprint
 */
export const computeJktFromJwk = async (jwk: DPoPJwk): Promise<string> => {
	const { kty } = jwk;

	// build canonical JWK based on key type (RFC 7638)
	let canonical: Record<string, string>;
	if (kty === 'EC') {
		const { crv, x, y } = jwk;
		canonical = { crv, kty, x, y };
	} else if (kty === 'RSA') {
		const { e, n } = jwk;
		canonical = { e, kty, n };
	} else {
		const { crv, x } = jwk;
		canonical = { crv, kty, x };
	}

	const serialized = JSON.stringify(canonical);
	const hash = await toSha256(encodeUtf8(serialized));

	return toBase64Url(hash);
};

/**
 * decodes a base64url string to JSON.
 */
const decodeBase64UrlJson = (str: string): unknown => {
	const bytes = fromBase64Url(str);
	return JSON.parse(decodeUtf8From(bytes));
};

/**
 * verifies a DPoP proof from a request header.
 *
 * @param dpopHeader the DPoP header value
 * @param options verification options
 * @returns verification result with claims and JWK thumbprint
 * @throws {DPoPVerifyError} if verification fails
 */
export const verifyDPoP = async (
	dpopHeader: string | null | undefined,
	options: DPoPVerifyOptions,
): Promise<DPoPVerifyResult> => {
	if (!dpopHeader) {
		throw new DPoPVerifyError('missing DPoP header', 'missing');
	}

	const { method, url, nonce: dpopNonce, maxClockSkew = 60 } = options;

	// parse the JWT
	const parts = dpopHeader.split('.');
	if (parts.length !== 3) {
		throw new DPoPVerifyError('invalid DPoP proof format', 'invalid');
	}

	// parse and validate header
	let header: v.Infer<typeof dpopHeaderSchema>;
	try {
		const raw = decodeBase64UrlJson(parts[0]);
		header = dpopHeaderSchema.parse(raw, { mode: 'passthrough' });
	} catch {
		throw new DPoPVerifyError('invalid DPoP header', 'invalid');
	}

	const { jwk, alg } = header;

	// import the public key and verify the signature
	let payload: v.Infer<typeof dpopPayloadSchema>;
	try {
		const key = await importJWK(jwk, alg);
		const result = await jwtVerify(dpopHeader, key, { typ: 'dpop+jwt' });
		payload = dpopPayloadSchema.parse(result.payload, { mode: 'passthrough' });
	} catch (err) {
		if (err instanceof v.ValitaError) {
			throw new DPoPVerifyError('invalid DPoP payload', 'invalid');
		}
		throw new DPoPVerifyError('DPoP signature verification failed', 'invalid');
	}

	const { htm, htu, iat, nonce: proofNonce } = payload;

	// validate claims
	if (htm !== method) {
		throw new DPoPVerifyError(`DPoP htm mismatch: expected ${method}, got ${htm}`, 'invalid');
	}

	if (htu !== url) {
		throw new DPoPVerifyError(`DPoP htu mismatch: expected ${url}, got ${htu}`, 'invalid');
	}

	const now = Math.floor(Date.now() / 1000);
	if (iat > now + maxClockSkew) {
		throw new DPoPVerifyError('DPoP proof issued in the future', 'invalid');
	}
	if (iat < now - maxClockSkew) {
		throw new DPoPVerifyError('DPoP proof expired', 'expired');
	}

	// validate nonce if configured
	if (dpopNonce) {
		if (!proofNonce || !(await dpopNonce.check(proofNonce))) {
			throw new DPoPVerifyError('invalid or missing DPoP nonce', 'nonce_required');
		}
	}

	// compute JWK thumbprint
	const jkt = await computeJktFromJwk(jwk);

	return { claims: payload, jkt, jwk };
};
