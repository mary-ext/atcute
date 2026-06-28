import type { SigningAlgorithm } from '../jwk/types.ts';

const HASH_BY_ALG: Record<SigningAlgorithm, 'SHA-256' | 'SHA-384' | 'SHA-512'> = {
	ES256: 'SHA-256',
	ES384: 'SHA-384',
	ES512: 'SHA-512',
	PS256: 'SHA-256',
	PS384: 'SHA-384',
	PS512: 'SHA-512',
	RS256: 'SHA-256',
	RS384: 'SHA-384',
	RS512: 'SHA-512',
};

const CURVE_BY_ALG: Record<SigningAlgorithm, 'P-256' | 'P-384' | 'P-521' | null> = {
	ES256: 'P-256',
	ES384: 'P-384',
	ES512: 'P-521',
	PS256: null,
	PS384: null,
	PS512: null,
	RS256: null,
	RS384: null,
	RS512: null,
};

export const getHashName = (alg: SigningAlgorithm): 'SHA-256' | 'SHA-384' | 'SHA-512' => {
	return HASH_BY_ALG[alg];
};

export const getNamedCurve = (alg: SigningAlgorithm): 'P-256' | 'P-384' | 'P-521' | null => {
	return CURVE_BY_ALG[alg];
};

export const getSignAlgorithm = (alg: SigningAlgorithm): AlgorithmIdentifier | EcdsaParams | RsaPssParams => {
	if (alg.startsWith('ES')) {
		return { name: 'ECDSA', hash: { name: getHashName(alg) } };
	}
	if (alg.startsWith('PS')) {
		return {
			name: 'RSA-PSS',
			hash: { name: getHashName(alg) },
			saltLength: getHashLength(getHashName(alg)),
		};
	}
	return { name: 'RSASSA-PKCS1-v1_5' };
};

export const getImportAlgorithm = (
	alg: SigningAlgorithm,
	curve?: 'P-256' | 'P-384' | 'P-521',
): EcKeyImportParams | RsaHashedImportParams => {
	if (alg.startsWith('ES')) {
		const namedCurve = curve ?? getNamedCurve(alg);
		if (!namedCurve) {
			throw new Error(`unable to determine curve for ${alg}`);
		}
		return { name: 'ECDSA', namedCurve };
	}

	if (alg.startsWith('PS')) {
		return { name: 'RSA-PSS', hash: { name: getHashName(alg) } };
	}

	return { name: 'RSASSA-PKCS1-v1_5', hash: { name: getHashName(alg) } };
};

export const getGenerateAlgorithm = (alg: SigningAlgorithm): EcKeyGenParams | RsaHashedKeyGenParams => {
	const curve = getNamedCurve(alg);
	if (curve) {
		return { name: 'ECDSA', namedCurve: curve };
	}

	const hash = { name: getHashName(alg) };
	return {
		name: alg.startsWith('PS') ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5',
		hash,
		modulusLength: 2048,
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
	};
};

const getHashLength = (hash: 'SHA-256' | 'SHA-384' | 'SHA-512'): number => {
	switch (hash) {
		case 'SHA-256': {
			return 32;
		}
		case 'SHA-384': {
			return 48;
		}
		case 'SHA-512': {
			return 64;
		}
	}
};
