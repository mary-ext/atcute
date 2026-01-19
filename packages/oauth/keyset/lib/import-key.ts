import { type JWK, exportJWK, exportPKCS8, generateKeyPair, importJWK, importPKCS8 } from 'jose';

import type { ImportKeyOptions, PrivateKey, SigningAlgorithm } from './types.js';

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

/** map EC curve to default algorithm */
const CURVE_TO_ALG: Record<string, SigningAlgorithm> = {
	'P-256': 'ES256',
	'P-384': 'ES384',
	'P-521': 'ES512',
};

const isSigningAlgorithm = (alg: string): alg is SigningAlgorithm => {
	return (SIGNING_ALGORITHMS as readonly string[]).includes(alg);
};

/**
 * generates a new private key for use with `private_key_jwt`.
 *
 * @param kid key ID to assign to the generated key
 * @param alg signing algorithm (defaults to 'ES256')
 * @returns private key ready for use in keyset
 */
export const generatePrivateKey = async (
	kid: string,
	alg: SigningAlgorithm = 'ES256',
): Promise<PrivateKey> => {
	const { privateKey } = await generateKeyPair(alg, { extractable: true });
	const jwk = await exportJWK(privateKey);
	jwk.alg = alg;
	jwk.kid = kid;

	const publicJwk = derivePublicJwk(jwk, kid, alg);

	return { kid, alg, key: privateKey, publicJwk };
};

/**
 * imports a private key from a JWK object or JSON string.
 *
 * @param input JWK object or JSON string containing a JWK
 * @param options override or provide `kid` and `alg`
 * @returns private key ready for use in keyset
 * @throws if `kid` cannot be determined, `alg` cannot be determined/inferred,
 *   or the key format is invalid
 *
 * resolution order:
 * - `kid`: `options.kid` ?? `input.kid` ?? error
 * - `alg`: `options.alg` ?? `input.alg` ?? inferred from curve ?? error
 *
 * algorithm inference (EC keys only):
 * - P-256 -> ES256, P-384 -> ES384, P-521 -> ES512
 * - RSA keys require explicit `alg` (no inference possible)
 */
export const importJwkKey = async (input: JWK | string, options?: ImportKeyOptions): Promise<PrivateKey> => {
	let jwk: JWK;

	if (typeof input === 'string') {
		try {
			jwk = JSON.parse(input) as JWK;
		} catch {
			throw new Error(`invalid JSON string`);
		}
	} else if (typeof input === 'object' && input !== null && 'kty' in input) {
		jwk = input;
	} else {
		throw new Error(`invalid input: expected JWK object or JSON string`);
	}

	// resolve kid
	const kid = options?.kid ?? jwk.kid;
	if (!kid) {
		throw new Error(`kid is required: provide via options or include in JWK`);
	}

	// resolve alg
	let alg = options?.alg ?? jwk.alg;
	if (!alg) {
		// try to infer from EC curve
		const crv = (jwk as { crv?: string }).crv;
		if (crv && crv in CURVE_TO_ALG) {
			alg = CURVE_TO_ALG[crv];
		} else {
			throw new Error(
				`alg is required: provide via options, include in JWK, or use an EC key with a known curve`,
			);
		}
	}

	if (!isSigningAlgorithm(alg)) {
		throw new Error(`unsupported algorithm: ${alg}`);
	}

	// verify this is a private key (has 'd' parameter for asymmetric keys)
	if (!('d' in jwk) || !jwk.d) {
		throw new Error(`expected a private key (missing 'd' parameter)`);
	}

	// import the JWK
	const imported = await importJWK(jwk, alg);
	if (!(imported instanceof CryptoKey)) {
		throw new Error(`expected asymmetric key, got symmetric`);
	}

	// derive public JWK by removing private components
	const publicJwk = derivePublicJwk(jwk, kid, alg);

	return { kid, alg, key: imported, publicJwk };
};

/**
 * imports a private key from a PKCS#8 PEM string.
 *
 * @param pem PKCS#8 PEM string (starts with '-----BEGIN PRIVATE KEY-----')
 * @param options must include `kid` and `alg`
 * @returns private key ready for use in keyset
 */
export const importPkcs8Key = async (
	pem: string,
	options: Required<ImportKeyOptions>,
): Promise<PrivateKey> => {
	const { kid, alg } = options;

	if (!isSigningAlgorithm(alg)) {
		throw new Error(`unsupported algorithm: ${alg}`);
	}

	const imported = await importPKCS8(pem, alg, { extractable: true });
	if (!(imported instanceof CryptoKey)) {
		throw new Error(`expected asymmetric key, got symmetric`);
	}

	const jwk = await exportJWK(imported);
	jwk.alg = alg;
	jwk.kid = kid;

	const publicJwk = derivePublicJwk(jwk, kid, alg);

	return { kid, alg, key: imported, publicJwk };
};

/**
 * exports a private key to JWK format.
 *
 * @param key private key to export
 * @returns JWK with `kid` and `alg` set
 */
export const exportJwkKey = async (key: PrivateKey): Promise<JWK> => {
	const jwk = await exportJWK(key.key);
	jwk.kid = key.kid;
	jwk.alg = key.alg;
	return jwk;
};

/**
 * exports a private key to PKCS#8 PEM format.
 *
 * @param key private key to export
 * @returns PKCS#8 PEM string
 */
export const exportPkcs8Key = async (key: PrivateKey): Promise<string> => {
	return exportPKCS8(key.key);
};

/**
 * derives a public JWK from a private JWK by removing private key material.
 */
const derivePublicJwk = (privateJwk: JWK, kid: string, alg: string): JWK => {
	const { kty } = privateJwk;

	if (kty === 'EC') {
		const { crv, x, y } = privateJwk as JWK & { crv: string; x: string; y: string };
		return { kty, crv, x, y, kid, alg, use: 'sig' };
	}

	if (kty === 'RSA') {
		const { n, e } = privateJwk as JWK & { n: string; e: string };
		return { kty, n, e, kid, alg, use: 'sig' };
	}

	if (kty === 'OKP') {
		const { crv, x } = privateJwk as JWK & { crv: string; x: string };
		return { kty, crv, x, kid, alg, use: 'sig' };
	}

	throw new Error(`unsupported key type: ${kty}`);
};
