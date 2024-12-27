import { describe, expect, it } from 'bun:test';

import { fromBase16, fromBase64 } from '@atcute/multibase';

import { parseDidKey } from '../../multibase.js';
import { createSecp256k1Keypair, Secp256k1PrivateKey, Secp256k1PublicKey } from './secp256k1.js';
import { secp256k1 } from '@noble/curves/secp256k1';
import { toSha256 } from '../../utils.js';

it('can create a new keypair and reimport it', async () => {
	const keypair = createSecp256k1Keypair();
	const privateKeyBytes = await keypair.exportPrivateKey('raw');

	const imported = new Secp256k1PrivateKey(privateKeyBytes);

	expect(await imported.did()).toBe(await keypair.did());
});

it('produces valid signatures', async () => {
	const keypair = createSecp256k1Keypair();

	const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
	const sig = await keypair.sign(data);

	const hash = await toSha256(data);

	const isValidSigNoble = secp256k1.verify(sig, hash, await keypair.exportPublicKey('raw'));
	const isValidSigSelf = await keypair.verify(sig, data);

	expect(isValidSigNoble).toBe(true);
	expect(isValidSigSelf).toBe(true);
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
		expect(parsed.type).toBe('secp256k1');

		const keypair = new Secp256k1PublicKey(parsed.publicKey);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(true);
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
		expect(parsed.type).toBe('secp256k1');

		const keypair = new Secp256k1PublicKey(parsed.publicKey);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(false);
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
		expect(parsed.type).toBe('secp256k1');

		const keypair = new Secp256k1PublicKey(parsed.publicKey);
		const isValidSig = await keypair.verify(sigBytes, messageBytes, { allowMalleableSig: true });

		expect(isValidSig).toBe(true);
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
		expect(parsed.type).toBe('secp256k1');

		const keypair = new Secp256k1PublicKey(parsed.publicKey);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(false);
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
		expect(parsed.type).toBe('secp256k1');

		const keypair = new Secp256k1PublicKey(parsed.publicKey);
		const isValidSig = await keypair.verify(sigBytes, messageBytes);

		expect(isValidSig).toBe(false);
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
			const keypair = new Secp256k1PrivateKey(privateKeyBytes);

			expect<string>(await keypair.did()).toBe(publicDidKey);
		}
	});
});
