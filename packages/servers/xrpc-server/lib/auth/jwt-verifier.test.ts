import { Secp256k1PrivateKeyExportable, type PrivateKeyExportable } from '@atcute/crypto';
import type { Did, Nsid } from '@atcute/lexicons';
import type { AtprotoAudience } from '@atcute/lexicons/syntax';
import { fromBase64Url, toBase64Url } from '@atcute/multibase';
import { decodeUtf8From, encodeUtf8 } from '@atcute/uint8array';

import { beforeAll, describe, expect, it } from 'vitest';

import { AuthRequiredError } from '../main/xrpc-error.ts';

import { createServiceJwt } from './jwt-creator.ts';
import { ServiceJwtVerifier, type ReplayStore } from './jwt-verifier.ts';

// re-sign a header/payload pair with the given keypair, producing a valid-signature JWT. used
// to construct tokens that exercise code paths `createServiceJwt` wouldn't (e.g. custom `kid`,
// missing `lxm`, synthetic `nbf`, stale `iat`).
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

const bearer = (jwt: string): Request => {
	return new Request('http://example.com/xrpc/com.example.method', {
		headers: { authorization: `Bearer ${jwt}` },
	});
};

const expectAuthError = async (promise: Promise<unknown>, code: string): Promise<AuthRequiredError> => {
	let caught: unknown;
	try {
		await promise;
	} catch (e) {
		caught = e;
	}

	if (!(caught instanceof AuthRequiredError)) {
		throw new Error(`expected AuthRequiredError, got ${caught}`);
	}
	if (!(caught.headers instanceof Headers)) {
		throw new Error(`expected Headers, got ${caught.headers}`);
	}

	expect(caught.headers.get('www-authenticate')).toContain(`error="${code}"`);
	return caught;
};

describe('ServiceJwtVerifier', () => {
	const issuerDid: Did = 'did:web:issuer.example.com';
	const audienceDid = 'did:web:audience.example.com' satisfies Did;
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

		const result = await verifier.verifyRequest(bearer(jwt), { lxm });
		expect(result).toEqual({ audience: audienceDid, issuer: issuerDid, lxm });
	});

	it('verifies a JWT with DID+fragment audience', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceRef],
			resolver: makeResolver(keypair),
		});

		const jwt = await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceRef, lxm });

		const result = await verifier.verifyRequest(bearer(jwt), { lxm });
		expect(result.audience).toBe(audienceRef);
	});

	it('accepts either form when multiple audiences are configured', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceRef, audienceDid],
			resolver: makeResolver(keypair),
		});

		for (const aud of [audienceDid, audienceRef] as const) {
			const jwt = await createServiceJwt({ keypair, issuer: issuerDid, audience: aud, lxm });
			await expect(verifier.verifyRequest(bearer(jwt), { lxm })).resolves.toBeTruthy();
		}
	});

	it('rejects a JWT whose audience is not in the configured list', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceRef],
			resolver: makeResolver(keypair),
		});

		const jwt = await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm });

		await expectAuthError(verifier.verifyRequest(bearer(jwt), { lxm }), 'InvalidAudience');
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

		await expect(verifier.verifyRequest(bearer(jwt), { lxm })).resolves.toBeTruthy();
	});

	it('rejects every audience when acceptAudiences is an empty array', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [],
			resolver: makeResolver(keypair),
		});

		const jwt = await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm });

		await expectAuthError(verifier.verifyRequest(bearer(jwt), { lxm }), 'InvalidAudience');
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

		await expectAuthError(verifier.verifyRequest(bearer(tampered), { lxm }), 'BadJwtIssuer');
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

		await expect(verifier.verifyRequest(bearer(signed), { lxm })).resolves.toBeTruthy();
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

		await expectAuthError(verifier.verifyRequest(bearer(signed), { lxm }), 'BadJwt');
	});

	it('rejects when the Authorization header is missing', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
		});

		const request = new Request('http://example.com/xrpc/com.example.method');
		await expect(verifier.verifyRequest(request, { lxm })).rejects.toBeInstanceOf(AuthRequiredError);
	});

	it('rejects when the Authorization header does not use Bearer', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
		});

		const request = new Request('http://example.com/xrpc/com.example.method', {
			headers: { authorization: 'Basic abc' },
		});

		await expectAuthError(verifier.verifyRequest(request, { lxm }), 'MissingBearer');
	});

	it('rejects an expired JWT', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
		});

		const now = Math.floor(Date.now() / 1_000);
		const jwt = await createServiceJwt({
			keypair,
			issuer: issuerDid,
			audience: audienceDid,
			lxm,
			issuedAt: now - 120,
			expiresIn: 60,
		});

		await expectAuthError(verifier.verifyRequest(bearer(jwt), { lxm }), 'JwtExpired');
	});

	it('rejects a JWT whose `nbf` is in the future', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
		});

		const now = Math.floor(Date.now() / 1_000);
		const [headerB64, payloadB64] = (
			await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm })
		).split('.');

		const header = decodePortion<Record<string, unknown>>(headerB64);
		const payload = { ...decodePortion<Record<string, unknown>>(payloadB64), nbf: now + 120 };
		const signed = await signRaw(keypair, header, payload);

		await expectAuthError(verifier.verifyRequest(bearer(signed), { lxm }), 'JwtNotYetValid');
	});

	it('rejects a JWT exceeding the configured maxAge', async () => {
		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
			maxAge: 60,
		});

		const now = Math.floor(Date.now() / 1_000);
		const jwt = await createServiceJwt({
			keypair,
			issuer: issuerDid,
			audience: audienceDid,
			lxm,
			issuedAt: now,
			expiresIn: 3600,
		});

		await expectAuthError(verifier.verifyRequest(bearer(jwt), { lxm }), 'JwtTooOld');
	});

	it('consults the replay store and rejects duplicates', async () => {
		const seen = new Set<string>();
		const replayStore: ReplayStore = {
			async check({ iss, jti }) {
				const key = `${iss}:${jti}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			},
		};

		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
			replayStore,
		});

		const jwt = await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm });

		await expect(verifier.verifyRequest(bearer(jwt), { lxm })).resolves.toBeTruthy();
		await expectAuthError(verifier.verifyRequest(bearer(jwt), { lxm }), 'NonceNotUnique');
	});

	it('rejects a JWT without jti when a replay store is configured', async () => {
		const replayStore: ReplayStore = {
			async check() {
				return true;
			},
		};

		const verifier = new ServiceJwtVerifier({
			acceptAudiences: [audienceDid],
			resolver: makeResolver(keypair),
			replayStore,
		});

		const [headerB64, payloadB64] = (
			await createServiceJwt({ keypair, issuer: issuerDid, audience: audienceDid, lxm })
		).split('.');

		const header = decodePortion<Record<string, unknown>>(headerB64);
		const { jti: _, ...payload } = decodePortion<Record<string, unknown>>(payloadB64);
		const signed = await signRaw(keypair, header, payload);

		await expectAuthError(verifier.verifyRequest(bearer(signed), { lxm }), 'BadJwt');
	});
});
