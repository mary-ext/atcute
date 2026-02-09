import { fromBase64Pad, toBase64Pad } from '@atcute/multibase';

import type { PrivateJwk, PublicJwk, SigningAlgorithm } from '../jwk/types.ts';

import { getImportAlgorithm } from './crypto.ts';

const SIGNING_ALGORITHMS: readonly SigningAlgorithm[] = [
	'ES256',
	'ES384',
	'ES512',
	'PS256',
	'PS384',
	'PS512',
	'RS256',
	'RS384',
	'RS512',
];

const CURVE_TO_ALG: Record<string, SigningAlgorithm> = {
	'P-256': 'ES256',
	'P-384': 'ES384',
	'P-521': 'ES512',
};

export const isSigningAlgorithm = (alg: string): alg is SigningAlgorithm => {
	return (SIGNING_ALGORITHMS as readonly string[]).includes(alg);
};

export const parsePrivateJwkInput = (input: PrivateJwk | string): PrivateJwk => {
	if (typeof input === 'string') {
		try {
			const jwk = JSON.parse(input) as PrivateJwk;
			return jwk;
		} catch {
			throw new Error(`invalid JSON string`);
		}
	}

	if (typeof input === 'object' && input !== null && 'kty' in input) {
		return input;
	}

	throw new Error(`invalid input: expected JWK object or JSON string`);
};

export const resolveSigningAlgorithm = (
	jwk: PrivateJwk,
	override?: SigningAlgorithm,
): SigningAlgorithm | undefined => {
	if (override) {
		return override;
	}

	const alg = jwk.alg;
	if (alg && isSigningAlgorithm(alg)) {
		return alg;
	}

	if (jwk.kty === 'EC') {
		const inferred = CURVE_TO_ALG[jwk.crv];
		if (inferred) {
			return inferred;
		}
	}

	return undefined;
};

export const derivePublicJwk = (privateJwk: PrivateJwk, kid?: string, alg?: SigningAlgorithm): PublicJwk => {
	if (privateJwk.kty === 'EC') {
		const { crv, x, y } = privateJwk;
		return { kty: 'EC', crv, x, y, kid, alg, use: 'sig' };
	}

	if (privateJwk.kty === 'RSA') {
		const { n, e } = privateJwk;
		return { kty: 'RSA', n, e, kid, alg, use: 'sig' };
	}

	throw new Error(`unsupported key type`);
};

export const importPrivateKeyFromJwk = async (jwk: PrivateJwk, alg: SigningAlgorithm): Promise<CryptoKey> => {
	if (!('d' in jwk) || !jwk.d) {
		throw new Error(`expected a private key (missing 'd' parameter)`);
	}

	if (jwk.kty === 'EC' && !alg.startsWith('ES')) {
		throw new Error(`algorithm ${alg} does not match ec key`);
	}
	if (jwk.kty === 'RSA' && alg.startsWith('ES')) {
		throw new Error(`algorithm ${alg} does not match rsa key`);
	}

	const algorithm = getImportAlgorithm(alg, jwk.kty === 'EC' ? jwk.crv : undefined);
	const key = await crypto.subtle.importKey('jwk', jwk, algorithm, true, ['sign']);

	if (!(key instanceof CryptoKey)) {
		throw new Error(`expected asymmetric key, got symmetric`);
	}

	return key;
};

export const exportPrivateJwkFromKey = async (
	key: CryptoKey,
	alg: SigningAlgorithm,
	kid?: string,
): Promise<PrivateJwk> => {
	const jwk = (await crypto.subtle.exportKey('jwk', key)) as PrivateJwk;
	jwk.alg = alg;
	if (kid) {
		jwk.kid = kid;
	}
	return jwk;
};

export const importPkcs8PrivateKey = async (pem: string, alg: SigningAlgorithm): Promise<CryptoKey> => {
	const bytes = parsePkcs8Pem(pem);
	const algorithm = getImportAlgorithm(alg);

	const key = await crypto.subtle.importKey('pkcs8', bytes, algorithm, true, ['sign']);

	if (!(key instanceof CryptoKey)) {
		throw new Error(`expected asymmetric key, got symmetric`);
	}

	return key;
};

export const exportPkcs8PrivateKey = async (key: CryptoKey): Promise<string> => {
	const pkcs8 = await crypto.subtle.exportKey('pkcs8', key);
	const bytes = new Uint8Array(pkcs8);
	const base64 = toBase64Pad(bytes);

	return ['-----BEGIN PRIVATE KEY-----', ...chunk64(base64), '-----END PRIVATE KEY-----', ''].join('\n');
};

const parsePkcs8Pem = (pem: string): ArrayBuffer => {
	const match = pem.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/);
	if (!match) {
		throw new Error(`invalid pkcs8 pem`);
	}

	const base64 = match[1].replace(/\s+/g, '');
	const bytes = fromBase64Pad(base64);
	const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
	return buffer;
};

const chunk64 = (input: string): string[] => {
	const chunks: string[] = [];
	for (let i = 0; i < input.length; i += 64) {
		chunks.push(input.slice(i, i + 64));
	}
	return chunks;
};
