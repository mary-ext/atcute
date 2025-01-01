if (globalThis.Bun) {
	const proc = Bun.spawnSync(['pnpx', 'tsx', import.meta.path])
	console.log(proc.stdout.toString('utf8'))
	console.log(proc.stderr.toString('utf8'))
	process.exit(proc.exitCode)
}

import assert from 'node:assert';

import { fromBase16, fromBase64 } from '@atcute/multibase';
import { secp256k1 } from '@noble/curves/secp256k1';

import { parseDidKey } from '../multibase.js';
import { toSha256 } from '../utils.js';

import { Secp256k1PrivateKey, Secp256k1PublicKey } from './secp256k1.node.js';

// piss off bun
const test = 'node:test'
const { describe, it } = await import(test);

it('creates a valid keypair', async () => {
	const keypair = await Secp256k1PrivateKey.createKeypair();

	const [privateKeyBytes, publicKeyBytes] = await Promise.all([
		keypair.exportPrivateKey('raw'),
		keypair.exportPublicKey('raw'),
	]);

	assert.equal(secp256k1.utils.isValidPrivateKey(privateKeyBytes), true);
	assert.deepEqual(publicKeyBytes, secp256k1.getPublicKey(privateKeyBytes));
});

it('produces valid signatures', async () => {
	const privateKeyBytes = secp256k1.utils.randomPrivateKey();
	const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes);

	const keypair = await Secp256k1PrivateKey.importRaw(privateKeyBytes);

	const data = Uint8Array.from([152, 84, 29, 213, 69, 13, 230, 62, 38, 206, 124, 121, 187, 144, 24, 149]);

	const hash = await toSha256(data);
	const sig = await keypair.sign(data);

	assert.equal(await keypair.verify(sig, data), true);

	assert.equal(await secp256k1.verify(sig, hash, publicKeyBytes, { format: 'compact', lowS: true }), true);
	assert.equal(await secp256k1.verify(sig, hash, publicKeyBytes, { format: 'der' }), false);
});

it('verifies valid signatures', async () => {
	const privateKeyBytes = secp256k1.utils.randomPrivateKey();
	const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes);

	const keypair = await Secp256k1PublicKey.importRaw(publicKeyBytes);

	const data = Uint8Array.from([190, 1, 153, 17, 7, 119, 192, 24, 126, 222, 91, 27, 245, 223, 150, 162]);

	const hash = await toSha256(data);
	const sig = secp256k1.sign(hash, privateKeyBytes, { lowS: true }).toCompactRawBytes();

	assert.equal(await keypair.verify(sig, data), true);
});

describe('.importRaw()', () => {
	it('imports public keys', async () => {
		const privateKeyBytes = secp256k1.utils.randomPrivateKey();
		const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes);

		assert.ok((await Secp256k1PublicKey.importRaw(publicKeyBytes)) instanceof Secp256k1PublicKey);
	});

	it('imports private keys without specifying public key', async () => {
		const privateKeyBytes = secp256k1.utils.randomPrivateKey();

		assert.ok((await Secp256k1PrivateKey.importRaw(privateKeyBytes)) instanceof Secp256k1PrivateKey);
	});

	it('imports keypairs', async () => {
		const privateKeyBytes = secp256k1.utils.randomPrivateKey();
		const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes);

		assert.ok(
			(await Secp256k1PrivateKey.importRaw(privateKeyBytes, publicKeyBytes)) instanceof Secp256k1PrivateKey,
		);
	});
});

describe('.exportPublicKey()', () => {
	it('exports to did:key', async () => {
		const privateKeyBytes = fromBase64('lnyDNAlX90mUXQaBYz7fu0cM2/ySG6f9sVIH52wvsuk');
		const keypair = await Secp256k1PrivateKey.importRaw(privateKeyBytes);

		assert.equal(
			await keypair.exportPublicKey('did'),
			'did:key:zQ3shd5jcqV5FA2nB2rzFNjwkNajyjMVJcG4AhRW8d7AtpBC4',
		);
	});

	it('exports to jwk', async () => {
		const privateKeyBytes = fromBase64('eSSQio9cugt0MFLdy9af2tl7m1EoMO74R0SAx7v5pRc');
		const keypair = await Secp256k1PrivateKey.importRaw(privateKeyBytes);

		assert.deepEqual(await keypair.exportPublicKey('jwk'), {
			// alg: 'ES256K', -- not required, not exported by node
			crv: 'secp256k1',
			kty: 'EC',
			// key_ops: ['verify', 'sign'], -- not required, not exported by node
			x: 'tvRSr4mycnI5LCglVx1Vbtc5LoLXjpjbVDYN43b2Bq0',
			y: '8U44reoLXDXrtVKkxILGvcSFvf2Xryaq6CjqBjY1jNc',
		});
	});

	it('exports to public multikey', async () => {
		const privateKeyBytes = fromBase64('UuoOmwlwobPzcJoQnMhIufxyQQoFqlkW6bvXf4p1sws');
		const keypair = await Secp256k1PrivateKey.importRaw(privateKeyBytes);

		assert.equal(
			await keypair.exportPublicKey('multikey'),
			'zQ3sheGhU9bT91u43Mkov7Qwv7jLNBeTbTCWiPQa8J6qfrKQ1',
		);
	});

	it('exports to raw bytes', async () => {
		const privateKeyBytes = fromBase64('QHo9dl0EkFZ5XSs3kypgi/wXWjjUj7fxGA3yZe5NF3g');
		const keypair = await Secp256k1PrivateKey.importRaw(privateKeyBytes);

		assert.deepEqual(
			await keypair.exportPublicKey('raw'),
			Uint8Array.from([
				2, 221, 137, 228, 117, 38, 237, 54, 85, 92, 151, 237, 8, 113, 194, 67, 122, 206, 124, 170, 87, 77,
				114, 234, 179, 169, 210, 154, 165, 3, 19, 131, 251,
			]),
		);
	});

	it('exports to raw hex', async () => {
		const privateKeyBytes = fromBase64('mLFOaqkgWJ2Pm8yOPayLmpAkehgOx9XOEO0Fj/8/ZIU');
		const keypair = await Secp256k1PrivateKey.importRaw(privateKeyBytes);

		assert.equal(
			await keypair.exportPublicKey('rawHex'),
			'03504094e4cf1edaf47c38c14470cf37cafb4a12456e718c89bc3cc3720a9f7e70',
		);
	});
});

describe('interop tests', () => {
	it('handles valid low-S signature', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `5WpdIuEUUfVUYaozsi8G0B3cWO09cgZbIIwg1t2YKdUn/FEznOndsz/qgiYb89zwxYCbB71f7yQK5Lr7NasfoA`,
			publicDidKey: `did:key:zQ3shqwJEJyMBsBXCWyCBpUBMqxcon9oHB7mCvx4sSpMdLJwc`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.publicDidKey);
		assert.equal(parsed.type, 'secp256k1');

		const keypair = await Secp256k1PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		assert.equal(isValidSig, true);
	});

	it('throws on high-S signature by default', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `5WpdIuEUUfVUYaozsi8G0B3cWO09cgZbIIwg1t2YKdXYA67MYxYiTMAVfdnkDCMN9S5B3vHosRe07aORmoshoQ`,
			publicDidKey: `did:key:zQ3shqwJEJyMBsBXCWyCBpUBMqxcon9oHB7mCvx4sSpMdLJwc`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.publicDidKey);
		assert.equal(parsed.type, 'secp256k1');

		const keypair = await Secp256k1PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		assert.equal(isValidSig, false);
	});

	it('handles high-S signature when specified', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `5WpdIuEUUfVUYaozsi8G0B3cWO09cgZbIIwg1t2YKdXYA67MYxYiTMAVfdnkDCMN9S5B3vHosRe07aORmoshoQ`,
			publicDidKey: `did:key:zQ3shqwJEJyMBsBXCWyCBpUBMqxcon9oHB7mCvx4sSpMdLJwc`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.publicDidKey);
		assert.equal(parsed.type, 'secp256k1');

		const keypair = await Secp256k1PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes, { allowMalleableSig: true });

		assert.equal(isValidSig, true);
	});

	it('throws on DER-encoded signature', async () => {
		const payload = {
			message: `oWVoZWxsb2V3b3JsZA`,
			sig: `MEUCIQCWumUqJqOCqInXF7AzhIRg2MhwRz2rWZcOEsOjPmNItgIgXJH7RnqfYY6M0eg33wU0sFYDlprwdOcpRn78Sz5ePgk`,
			publicDidKey: `did:key:zQ3shnriYMXc8wvkbJqfNWh5GXn2bVAeqTC92YuNbek4npqGF`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.publicDidKey);
		assert.equal(parsed.type, 'secp256k1');

		const keypair = await Secp256k1PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		assert.equal(isValidSig, false);
	});

	it('throws on DER-encoded signature crafted to look like compact signature', async () => {
		const payload = {
			message: `V3pYaEhvTGlrVkJhMGdOZw`,
			sig: `MD4CHRwVbupYdWlkNoZkAalJj4m2aRaFCvuKf+vjXh6kAh0RiqzBBCJsol9VNOVX6GcbSHj/sNAixbnlVOqK0w`,
			publicDidKey: `did:key:zQ3shWScmW4msQ7wxwgX4P2nvocGtfxwfxQGSLw7kSCoVMRq9`,
		};

		const messageBytes = fromBase64(payload.message);
		const sigBytes = fromBase64(payload.sig);

		const parsed = parseDidKey(payload.publicDidKey);
		assert.equal(parsed.type, 'secp256k1');

		const keypair = await Secp256k1PublicKey.importRaw(parsed.publicKeyBytes);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		assert.equal(isValidSig, false);
	});

	it('derives the expected did:key', async () => {
		const inputs = [
			{
				privateKeyBytesHex: '9085d2bef69286a6cbb51623c8fa258629945cd55ca705cc4e66700396894e0c',
				publicDidKey: 'did:key:zQ3shokFTS3brHcDQrn82RUDfCZESWL1ZdCEJwekUDPQiYBme',
			},
			{
				privateKeyBytesHex: 'f0f4df55a2b3ff13051ea814a8f24ad00f2e469af73c363ac7e9fb999a9072ed',
				publicDidKey: 'did:key:zQ3shtxV1FrJfhqE1dvxYRcCknWNjHc3c5X1y3ZSoPDi2aur2',
			},
			{
				privateKeyBytesHex: '6b0b91287ae3348f8c2f2552d766f30e3604867e34adc37ccbb74a8e6b893e02',
				publicDidKey: 'did:key:zQ3shZc2QzApp2oymGvQbzP8eKheVshBHbU4ZYjeXqwSKEn6N',
			},
			{
				privateKeyBytesHex: 'c0a6a7c560d37d7ba81ecee9543721ff48fea3e0fb827d42c1868226540fac15',
				publicDidKey: 'did:key:zQ3shadCps5JLAHcZiuX5YUtWHHL8ysBJqFLWvjZDKAWUBGzy',
			},
			{
				privateKeyBytesHex: '175a232d440be1e0788f25488a73d9416c04b6f924bea6354bf05dd2f1a75133',
				publicDidKey: 'did:key:zQ3shptjE6JwdkeKN4fcpnYQY3m9Cet3NiHdAfpvSUZBFoKBj',
			},
		];

		for (const { privateKeyBytesHex, publicDidKey } of inputs) {
			const privateKeyBytes = fromBase16(privateKeyBytesHex);
			const keypair = await Secp256k1PrivateKey.importRaw(privateKeyBytes);

			assert.equal(await keypair.exportPublicKey('did'), publicDidKey);
		}
	});
});
