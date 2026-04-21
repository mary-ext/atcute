import { Secp256k1PrivateKeyExportable, type PrivateKeyExportable } from '@atcute/crypto';
import type { Did, Nsid } from '@atcute/lexicons';
import type { AtprotoAudience } from '@atcute/lexicons/syntax';
import { fromBase64Url, toBase64Url } from '@atcute/multibase';
import { decodeUtf8From, encodeUtf8 } from '@atcute/uint8array';

import { beforeAll, describe, expect, it } from 'vitest';

import { createServiceJwt } from './jwt-creator.ts';
import { ServiceJwtVerifier } from './jwt-verifier.ts';

// re-sign a header/payload pair with the given keypair, producing a valid-signature JWT. used
// to construct tokens that exercise code paths `createServiceJwt` wouldn't (e.g. custom `kid`,
// missing `lxm`).
const signRaw = async (keypair: PrivateKeyExportable, header: unknown, payload: unknown): Promise<string> => {
	const encode = (data: unknown) => toBase64Url(encodeUtf8(JSON.stringify(data)));

	const headerB64 = encode(header);
	const payloadB64 = encode(payload);
	const signature = await keypair.sign(encodeUtf8(`${headerB64}.${payloadB64}`));

	return `${headerB64}.${payloadB64}.${toBase64Url(signature)}`;
};

const decodePortion = <T>(part: string): T => {
	return JSON.parse(decodeUtf8From(fromBase64Url(part)));
};

describe('ServiceJwtVerifier', () => {
	const issuerDid: Did = 'did:web:issuer.example.com';
	const audienceDid: Did = 'did:web:audience.example.com';
	const audienceRef: AtprotoAudience = `${audienceDid}#svc`;
	const lxm: Nsid = 'com.example.method';

	let keypair: PrivateKeyExportable;

	beforeAll(async () => {
		keypair = await Secp256k1PrivateKeyExportable.createKeypair();
	});

	const makeResolver = (kp: PrivateKeyExportable) => ({
		async resolve(did: Did) {
			return {
				'@context': [],
				id: did,
				verificationMethod: [
					{
						id: `${did}#atproto`,
						type: 'Multikey',
						controller: did,
						publicKeyMultibase: await kp.exportPublicKey('multikey'),
					},
				],
			};
		},
	});

	it('verifies a valid JWT with bare DID audience', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
		});

		const jwt = await createServiceJwt({
			keypair,
			issuer: issuerDid,
			audience: audienceDid,
			lxm,
		});

		const result = await verifier.verify(jwt, { lxm });
		expect(result.ok).toBe(true);

		if (result.ok) {
			expect(result.value).toEqual({ audience: audienceDid, issuer: issuerDid, lxm });
		}
	});

	it('verifies a JWT with DID+fragment audience', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceRef],
			resolver: makeResolver(keypair),
		});

		const jwt = await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceRef, lxm });

		const result = await verifier.verify(jwt, { lxm });
		expect(result.ok).toBe(true);

		if (result.ok) {
			expect(result.value.audience).toBe(audienceRef);
		}
	});

	it('accepts either form when multiple audiences are configured', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceRef, audienceDid],
			resolver: makeResolver(keypair),
		});

		for (const aud of [audienceDid, audienceRef] as const) {
			const jwt = await createServiceJwt({ keypair, issuer: issuerDid, audience: aud, lxm });
			const result = await verifier.verify(jwt, { lxm });

			expect(result.ok).toBe(true);
		}
	});

	it('rejects a JWT whose audience is not in the configured list', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceRef],
			resolver: makeResolver(keypair),
		});

		const jwt = await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm });

		const result = await verifier.verify(jwt, { lxm });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.error).toBe('BadJwtAudience');
		}
	});

	it('skips audience validation when acceptAudiences is null', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: null,
			resolver: makeResolver(keypair),
		});

		const jwt = await createServiceJwt({
			keypair,
			issuer: issuerDid,
			audience: 'did:web:unrelated.example',
			lxm,
		});

		const result = await verifier.verify(jwt, { lxm });
		expect(result.ok).toBe(true);
	});

	it('rejects every audience when acceptAudiences is an empty array', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [],
			resolver: makeResolver(keypair),
		});

		const jwt = await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm });

		const result = await verifier.verify(jwt, { lxm });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.error).toBe('BadJwtAudience');
		}
	});

	it('rejects a JWT with an unsupported `kid` header', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
		});

		const [headerB64, payloadB64] = (
			await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm })
		).split('.');

		const header = { ...decodePortion<Record<string, unknown>>(headerB64), kid: '#someOtherKey' };
		const payload = decodePortion<Record<string, unknown>>(payloadB64);
		const tampered = await signRaw(keypair, header, payload);

		const result = await verifier.verify(tampered, { lxm });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.error).toBe('BadJwtIssuer');
		}
	});

	it('accepts a JWT with `kid: "#atproto"`', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
		});

		const [headerB64, payloadB64] = (
			await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm })
		).split('.');

		const header = { ...decodePortion<Record<string, unknown>>(headerB64), kid: '#atproto' };
		const payload = decodePortion<Record<string, unknown>>(payloadB64);
		const signed = await signRaw(keypair, header, payload);

		const result = await verifier.verify(signed, { lxm });
		expect(result.ok).toBe(true);
	});

	it('rejects a JWT missing the `lxm` claim', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
		});

		const [headerB64, payloadB64] = (
			await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm })
		).split('.');

		const header = decodePortion<Record<string, unknown>>(headerB64);
		const { lxm: _, ...payload } = decodePortion<Record<string, unknown>>(payloadB64);
		const signed = await signRaw(keypair, header, payload);

		const result = await verifier.verify(signed, { lxm });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.error).toBe('MalformedJwt');
		}
	});
});
