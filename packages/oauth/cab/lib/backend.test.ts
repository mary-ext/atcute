import { fromBase64Url } from '@atcute/multibase';
import { createDpopProofSigner, generateClientAssertionKey, generateDpopKey } from '@atcute/oauth-crypto';
import { Keyset } from '@atcute/oauth-keyset';
import { CLIENT_ASSERTION_TYPE_JWT_BEARER } from '@atcute/oauth-types';
import { decodeUtf8From } from '@atcute/uint8array';

import { expect, it } from 'vitest';

import { ClientAssertionBackend, isValidAud } from './backend.ts';
import { MemoryDpopNonceProvider } from './nonce.ts';

const CLIENT_ID = 'https://client.example/oauth-client-metadata.json';
const ENDPOINT = 'https://client.example/oauth/client-assertion';
const HTU = 'https://client.example/oauth/client-assertion';
const AUD = 'https://pds.example';

const decodeJwtPayload = (jwt: string): Record<string, unknown> => {
	return JSON.parse(decodeUtf8From(fromBase64Url(jwt.split('.')[1])));
};

const setup = async () => {
	const keyset = new Keyset([await generateClientAssertionKey('key-1')]);
	const sign = createDpopProofSigner(await generateDpopKey(['ES256']));
	return { keyset, sign };
};

it('verifies a proof and mints a bound assertion', async () => {
	const { keyset, sign } = await setup();
	const backend = new ClientAssertionBackend({ clientId: CLIENT_ID, endpoint: ENDPOINT, keyset });

	const result = await backend.verify({ dpopProof: await sign('POST', HTU) });
	expect(result.ok).toBe(true);
	if (!result.ok) {
		return;
	}

	const issued = await backend.issue(result.verified, { aud: AUD });
	expect(issued.clientAssertionType).toBe(CLIENT_ASSERTION_TYPE_JWT_BEARER);
	expect(issued.clientId).toBe(CLIENT_ID);
	expect(issued.expiresIn).toBe(60);

	const payload = decodeJwtPayload(issued.clientAssertion);
	expect(payload.iss).toBe(CLIENT_ID);
	expect(payload.sub).toBe(CLIENT_ID);
	expect(payload.aud).toBe(AUD);
	// the security property: the assertion is bound to the DPoP key thumbprint
	expect(payload.cnf).toEqual({ jkt: result.verified.jkt });
});

it('returns missing when the proof is absent', async () => {
	const { keyset } = await setup();
	const backend = new ClientAssertionBackend({ clientId: CLIENT_ID, endpoint: ENDPOINT, keyset });

	expect(await backend.verify({ dpopProof: null })).toEqual({ ok: false, reason: 'missing' });
});

it('rejects a proof signed for a different htu', async () => {
	const { keyset, sign } = await setup();
	const backend = new ClientAssertionBackend({ clientId: CLIENT_ID, endpoint: ENDPOINT, keyset });

	const result = await backend.verify({ dpopProof: await sign('POST', 'https://evil.example/cab') });
	expect(result).toEqual({ ok: false, reason: 'invalid' });
});

it('rejects an endpoint with a query or fragment', async () => {
	const { keyset } = await setup();
	expect(() => {
		return new ClientAssertionBackend({ clientId: CLIENT_ID, endpoint: `${ENDPOINT}?a=1`, keyset });
	}).toThrow();
});

it('throws when issuing for a syntactically invalid aud', async () => {
	const { keyset, sign } = await setup();
	const backend = new ClientAssertionBackend({ clientId: CLIENT_ID, endpoint: ENDPOINT, keyset });

	const result = await backend.verify({ dpopProof: await sign('POST', HTU) });
	expect(result.ok).toBe(true);
	if (!result.ok) {
		return;
	}

	await expect(backend.issue(result.verified, { aud: 'not a url' })).rejects.toThrow();
});

it('challenges for a nonce, accepts it, and rejects replay (single-use)', async () => {
	const { keyset, sign } = await setup();
	const nonces = new MemoryDpopNonceProvider();
	const backend = new ClientAssertionBackend({ clientId: CLIENT_ID, endpoint: ENDPOINT, keyset, nonces });

	const first = await backend.verify({ dpopProof: await sign('POST', HTU) });
	expect(first.ok).toBe(false);
	if (first.ok || first.reason !== 'nonce_required') {
		throw new Error(`expected nonce_required`);
	}
	const nonce = first.nonce;

	expect((await backend.verify({ dpopProof: await sign('POST', HTU, nonce) })).ok).toBe(true);

	// the same nonce cannot be used twice
	const replayed = await backend.verify({ dpopProof: await sign('POST', HTU, nonce) });
	expect(replayed.ok).toBe(false);
});

it('rejects an unknown aud via isValidAud', async () => {
	expect(isValidAud(AUD)).toBe(true);
	expect(isValidAud('not a url')).toBe(false);
	expect(isValidAud('https://pds.example/')).toBe(false);
});
