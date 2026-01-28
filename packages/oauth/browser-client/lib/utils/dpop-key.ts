import { fromBase64Url } from '@atcute/multibase';
import type { DpopPrivateJwk } from '@atcute/oauth-crypto';

export interface LegacyDpopKey {
	typ: 'ES256';
	key: string;
	jwt: string;
	jkt?: string;
}

const ES256_ALG = { name: 'ECDSA', namedCurve: 'P-256' } as const;

export const isLegacyDpopKey = (key: DpopPrivateJwk | LegacyDpopKey): key is LegacyDpopKey => {
	return typeof (key as LegacyDpopKey).key === 'string' && typeof (key as LegacyDpopKey).jwt === 'string';
};

export const migrateLegacyDpopKey = async (key: LegacyDpopKey): Promise<DpopPrivateJwk> => {
	const pkcs8 = fromBase64Url(key.key);
	const cryptoKey = await crypto.subtle.importKey('pkcs8', pkcs8, ES256_ALG, true, ['sign']);
	const jwk = (await crypto.subtle.exportKey('jwk', cryptoKey)) as DpopPrivateJwk;
	jwk.alg = 'ES256';

	return jwk;
};
