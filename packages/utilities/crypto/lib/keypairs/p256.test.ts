import { describe, expect, it } from 'vitest';

import { fromBase58Btc, fromBase64 } from '@atcute/multibase';
import { toSha256 } from '@atcute/uint8array';
import { p256 } from '@noble/curves/p256';

import { parseDidKey } from '../multibase.js';

import { P256PrivateKey, P256PrivateKeyExportable, P256PublicKey } from './p256.js';

it('creates a valid keypair', async () => {
	const keypair = await P256PrivateKeyExportable.createKeypair();

	const [privateKeyBytes, publicKeyBytes] = await Promise.all([
		keypair.exportPrivateKey('raw'),
		keypair.exportPublicKey('raw'),
	]);

	expect(p256.utils.isValidPrivateKey(privateKeyBytes)).toBe(true);
	expect(publicKeyBytes).toEqual(p256.getPublicKey(privateKeyBytes));
});

it('produces valid signatures', async () => {
	const privateKeyBytes = p256.utils.randomPrivateKey();
	const publicKeyBytes = p256.getPublicKey(privateKeyBytes);

	const keypair = await P256PrivateKey.importRaw(privateKeyBytes);

	const data = Uint8Array.from([152, 84, 29, 213, 69, 13, 230, 62, 38, 206, 124, 121, 187, 144, 24, 149]);

	const hash = await toSha256(data);
	const sig = await keypair.sign(data);

	await expect(keypair.verify(sig, data)).resolves.toBe(true);

	expect(p256.verify(sig, hash, publicKeyBytes, { format: 'compact', lowS: true })).toBe(true);
	expect(p256.verify(sig, hash, publicKeyBytes, { format: 'der' })).toBe(false);
});

it('verifies valid signatures', async () => {
	const privateKeyBytes = p256.utils.randomPrivateKey();
	const publicKeyBytes = p256.getPublicKey(privateKeyBytes);

	const keypair = await P256PublicKey.importRaw(publicKeyBytes);

	const data = Uint8Array.from([190, 1, 153, 17, 7, 119, 192, 24, 126, 222, 91, 27, 245, 223, 150, 162]);

	const hash = await toSha256(data);
	const sig = p256.sign(hash, privateKeyBytes, { lowS: true }).toCompactRawBytes();

	await expect(keypair.verify(sig, data)).resolves.toBe(true);
});

describe('.importCryptoKey()', () => {
	it('imports public keys', async () => {
		const { publicKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);

		await expect(P256PublicKey.importCryptoKey(publicKey)).resolves.toBeInstanceOf(P256PublicKey);
	});

	it('imports private keys without specifying public key', async () => {
		const { privateKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);

		await expect(P256PrivateKey.importCryptoKey(privateKey)).resolves.toBeInstanceOf(P256PrivateKey);
	});

	it('imports keypairs', async () => {
		const cryptoKeyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);

		await expect(P256PrivateKey.importCryptoKeyPair(cryptoKeyPair)).resolves.toBeInstanceOf(P256PrivateKey);
	});

	it('throws on mismatching public/private keys', async () => {
		const { publicKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);
		const { privateKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify',
		]);

		await expect(P256PrivateKey.importCryptoKey(privateKey, publicKey)).rejects.toThrowError(TypeError);
	});
});

describe('.importRaw()', () => {
	it('imports public keys', async () => {
		const privateKeyBytes = p256.utils.randomPrivateKey();
		const publicKeyBytes = p256.getPublicKey(privateKeyBytes);

		await expect(P256PublicKey.importRaw(publicKeyBytes)).resolves.toBeInstanceOf(P256PublicKey);
	});

	it('imports private keys without specifying public key', async () => {
		const privateKeyBytes = p256.utils.randomPrivateKey();

		await expect(P256PrivateKey.importRaw(privateKeyBytes)).resolves.toBeInstanceOf(P256PrivateKey);
	});

	it('imports keypairs', async () => {
		const privateKeyBytes = p256.utils.randomPrivateKey();
		const publicKeyBytes = p256.getPublicKey(privateKeyBytes);

		await expect(P256PrivateKey.importRaw(privateKeyBytes, publicKeyBytes)).resolves.toBeInstanceOf(
			P256PrivateKey,
		);
	});

	it('throws on mismatching public/private keys', async () => {
		const privateKeyBytes = p256.utils.randomPrivateKey();
		const publicKeyBytes = p256.getPublicKey(p256.utils.randomPrivateKey());

		await expect(P256PrivateKey.importRaw(privateKeyBytes, publicKeyBytes)).rejects.toThrowError(TypeError);
	});
});

describe('.exportPublicKey()', () => {
	it('exports to did:key', async () => {
		const privateKeyBytes = fromBase64('b2vDXk9p9Kh7f9u0xti4Rjx4+tT28q4XYPmfI7pxzAc');
		const keypair = await P256PrivateKey.importRaw(privateKeyBytes);

		await expect(keypair.exportPublicKey('did')).resolves.toBe(
			'did:key:zDnaevURQesjPkE2ACUx9kwopEeKVMK2zjP7A5HacsZMmCxcB',
		);
	});

	it('exports to jwk', async () => {
		const privateKeyBytes = fromBase64('rh7915PGO1Nh8CNyx86LmZvh7ZOccv6b4kIm0uKu9zU');
		const keypair = await P256PrivateKey.importRaw(privateKeyBytes);

		await expect(keypair.exportPublicKey('jwk')).resolves.toEqual({
			ext: true,
			crv: 'P-256',
			kty: 'EC',
			key_ops: ['verify'],
			x: 'mxjzkh8DQT-08wXHzNI1DJxhoq1JHyada1TRFY2Axx8',
			y: 'QjXoWjORY7B5whibAmh2DunhbKDeOxOnWygGtiTzdzA',
		});
	});

	it('exports to public multikey', async () => {
		const privateKeyBytes = fromBase64('M5deCDwbAmRW3qL9ws6vfZjSedY6XmjYxFAohQxLR9k');
		const keypair = await P256PrivateKey.importRaw(privateKeyBytes);

		await expect(keypair.exportPublicKey('multikey')).resolves.toBe(
			'zDnaep6ZR8mk6b78W8wwawTwANTmRabwCRoEbSuUsw6AHUsYB',
		);
	});

	it('exports to raw hex', async () => {
		const privateKeyBytes = fromBase64('Q3LCvMkLKh4kHr6COEpMiwXTea5ydf748jFVcFSvfZ0');
		const keypair = await P256PrivateKey.importRaw(privateKeyBytes);

		await expect(keypair.exportPublicKey('rawHex')).resolves.toBe(
			'039474b445c1fa58cfa29018f0fc12a2e766a7caf2d22753d2e064764565c7f27e',
		);
	});

	it('exports to raw', async () => {
		const privateKeyBytes = fromBase64('VgaIrt49A1E64Yy0TPXatKf6VCfqd4ktkYfVOsohFDg');
		const keypair = await P256PrivateKey.importRaw(privateKeyBytes);

		await expect(keypair.exportPublicKey('raw')).resolves.toEqual(
			Uint8Array.from([
				3, 122, 46, 223, 211, 157, 130, 79, 42, 12, 145, 102, 229, 171, 83, 54, 75, 125, 249, 21, 246, 189,
				16, 39, 57, 48, 219, 158, 138, 171, 140, 162, 90,
			]),
		);
	});
});

describe('interop tests', () => {
	it('handles low-S signature', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `2vZNsG3UKvvO/CDlrdvyZRISOFylinBh0Jupc6KcWoJWExHptCfduPleDbG3rko3YZnn9Lw0IjpixVmexJDegg`,
			didKey: `did:key:zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = await P256PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(true);
	});

	it('throws on high-S signature by default', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `2vZNsG3UKvvO/CDlrdvyZRISOFylinBh0Jupc6KcWoKp7O4VS9giSAah8k5IUbXIW00SuOrjfEqQ9HEkN9JGzw`,
			didKey: `did:key:zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = await P256PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(false);
	});

	it('handles high-S signature when specified', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `2vZNsG3UKvvO/CDlrdvyZRISOFylinBh0Jupc6KcWoKp7O4VS9giSAah8k5IUbXIW00SuOrjfEqQ9HEkN9JGzw`,
			didKey: `did:key:zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = await P256PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes, { allowMalleableSig: true });

		expect(isValidSig).toBe(true);
	});

	it('throws on DER-encoded signature', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `MEQCIFxYelWJ9lNcAVt+jK0y/T+DC/X4ohFZ+m8f9SEItkY1AiACX7eXz5sgtaRrz/SdPR8kprnbHMQVde0T2R8yOTBweA`,
			didKey: `did:key:zDnaeT6hL2RnTdUhAPLij1QBkhYZnmuKyM7puQLW1tkF4Zkt8`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.didKey);
		expect(parsed.type).toBe('p256');

		const keypair = await P256PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(false);
	});

	it('derives the expected did:key', async () => {
		const inputs = [
			{
				privateKeyBytesBase58: '9p4VRzdmhsnq869vQjVCTrRry7u4TtfRxhvBFJTGU2Cp',
				publicDidKey: 'did:key:zDnaeTiq1PdzvZXUaMdezchcMJQpBdH2VN4pgrrEhMCCbmwSb',
			},
		];

		for (const { privateKeyBytesBase58, publicDidKey } of inputs) {
			const privateKeyBytes = fromBase58Btc(privateKeyBytesBase58);
			const keypair = await P256PrivateKey.importRaw(privateKeyBytes);

			expect<string>(await keypair.exportPublicKey('did')).toBe(publicDidKey);
		}
	});
});
