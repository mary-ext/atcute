import { P256PrivateKeyExportable, Secp256k1PrivateKeyExportable } from '@atcute/crypto';
import type { Did, Nsid } from '@atcute/lexicons';
import { fromBase64Url } from '@atcute/multibase';
import { decodeUtf8From, encodeUtf8 } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { createServiceJwt } from './jwt-creator.ts';

describe('createServiceJwt', () => {
	const issuerDid: Did = 'did:web:issuer.example.com';
	const audienceDid: Did = 'did:web:audience.example.com';
	const lxm: Nsid = 'com.example.method';

	it('creates a JWT token with secp256k1 keypair', async () => {
		const keypair = await Secp256k1PrivateKeyExportable.createKeypair();

		const now = Math.floor(Date.now() / 1_000);

		const jwt = await createServiceJwt({
			keypair: keypair,
			issuer: issuerDid,
			audience: audienceDid,
			lxm: lxm,
			issuedAt: now,
			expiresIn: 60,
		});

		expect(jwt).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);

		const [headerB64, payloadB64, signatureB64] = jwt.split('.');

		const header = JSON.parse(decodeUtf8From(fromBase64Url(headerB64)));
		const payload = JSON.parse(decodeUtf8From(fromBase64Url(payloadB64)));

		expect(header).toEqual({ typ: 'JWT', alg: 'ES256K' });
		expect(payload).toEqual({
			aud: audienceDid,
			exp: now + 60,
			iat: now,
			iss: issuerDid,
			jti: expect.stringMatching(/^[A-Za-z0-9_-]+$/),
			lxm: lxm,
		});

		const signature = fromBase64Url(signatureB64);
		const message = encodeUtf8(`${headerB64}.${payloadB64}`);

		const result = await keypair.verify(signature, message, {
			allowMalleableSig: true,
		});

		expect(result).toBe(true);
	});

	it('creates a JWT token with p256 keypair', async () => {
		const keypair = await P256PrivateKeyExportable.createKeypair();

		const now = Math.floor(Date.now() / 1_000);

		const jwt = await createServiceJwt({
			keypair: keypair,
			audience: audienceDid,
			issuer: issuerDid,
			lxm: lxm,
			issuedAt: now,
			expiresIn: 60,
		});

		expect(jwt).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);

		const [headerB64, payloadB64, signatureB64] = jwt.split('.');

		const header = JSON.parse(decodeUtf8From(fromBase64Url(headerB64)));
		const payload = JSON.parse(decodeUtf8From(fromBase64Url(payloadB64)));

		expect(header).toEqual({ typ: 'JWT', alg: 'ES256' });
		expect(payload).toEqual({
			aud: audienceDid,
			exp: now + 60,
			iat: now,
			iss: issuerDid,
			jti: expect.stringMatching(/^[A-Za-z0-9_-]+$/),
			lxm: lxm,
		});

		const signature = fromBase64Url(signatureB64);
		const message = encodeUtf8(`${headerB64}.${payloadB64}`);

		const result = await keypair.verify(signature, message, {
			allowMalleableSig: true,
		});

		expect(result).toBe(true);
	});
});
