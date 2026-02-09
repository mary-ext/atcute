import { fromBase64Url, toBase64Url } from '@atcute/multibase';
import { decodeUtf8From, encodeUtf8 } from '@atcute/uint8array';

import { getSignAlgorithm } from '../internal/crypto.ts';
import type { SigningAlgorithm } from '../jwk/types.ts';

/**
 * signs a jwt using webcrypto.
 *
 * @param params signing parameters
 * @returns signed jwt
 */
export const signJwt = async (params: {
	header: Record<string, unknown>;
	payload: Record<string, unknown>;
	key: CryptoKey;
	alg: SigningAlgorithm;
}): Promise<string> => {
	const { header, payload, key, alg } = params;
	const fullHeader = { ...header, alg };
	const headerSegment = encodeSegment(fullHeader);
	const payloadSegment = encodeSegment(payload);
	const signingInput = `${headerSegment}.${payloadSegment}`;

	const signature = await crypto.subtle.sign(
		getSignAlgorithm(alg),
		key,
		encodeUtf8(signingInput) as Uint8Array<ArrayBuffer>,
	);

	const signatureSegment = toBase64Url(new Uint8Array(signature));

	return `${signingInput}.${signatureSegment}`;
};

/**
 * verifies a jwt and returns its payload.
 *
 * @param jwt jwt string
 * @param options verification options
 * @returns decoded payload
 */
export const verifyJwt = async (
	jwt: string,
	options: { key: CryptoKey; alg: SigningAlgorithm; typ?: string },
): Promise<Record<string, unknown>> => {
	const { key, alg, typ } = options;
	const parts = jwt.split('.');
	if (parts.length !== 3) {
		throw new Error(`invalid jwt format`);
	}

	const header = decodeSegment<Record<string, unknown>>(parts[0]);
	if (header.alg !== alg) {
		throw new Error(`invalid jwt alg`);
	}
	if (typ && header.typ !== typ) {
		throw new Error(`invalid jwt typ`);
	}

	const payload = decodeSegment<Record<string, unknown>>(parts[1]);
	const signature = fromBase64Url(parts[2]);
	const signingInput = `${parts[0]}.${parts[1]}`;

	const ok = await crypto.subtle.verify(
		getSignAlgorithm(alg),
		key,
		signature,
		encodeUtf8(signingInput) as Uint8Array<ArrayBuffer>,
	);

	if (!ok) {
		throw new Error(`invalid jwt signature`);
	}

	return payload;
};

const encodeSegment = (value: unknown): string => {
	return toBase64Url(encodeUtf8(JSON.stringify(value)));
};

const decodeSegment = <T>(value: string): T => {
	const bytes = fromBase64Url(value);
	return JSON.parse(decodeUtf8From(bytes)) as T;
};
