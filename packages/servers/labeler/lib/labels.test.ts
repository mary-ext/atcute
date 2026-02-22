import { fromBytes, isBytes } from '@atcute/cbor';
import { Secp256k1PrivateKey } from '@atcute/crypto';
import type { Did } from '@atcute/lexicons';

import { describe, expect, it } from 'vitest';

import { formatLabel, signLabel } from './labels.ts';
import type { SavedLabel } from './store.ts';

const TEST_DID = 'did:plc:test1234' as Did;

const getTestKey = async () => {
	// deterministic test key (32 bytes)
	const keyBytes = new Uint8Array(32);
	keyBytes[0] = 1;
	return Secp256k1PrivateKey.importRaw(keyBytes);
};

describe('signLabel', () => {
	it('should produce a 64-byte compact secp256k1 signature', async () => {
		const key = await getTestKey();

		const signed = await signLabel({ uri: 'did:plc:target', val: 'spam' }, TEST_DID, key);

		expect(signed.sig).toBeInstanceOf(Uint8Array);
		expect(signed.sig.byteLength).toBe(64);
		expect(signed.src).toBe(TEST_DID);
		expect(signed.uri).toBe('did:plc:target');
		expect(signed.val).toBe('spam');
		expect(signed.neg).toBe(false);
		expect(signed.cts).toBeDefined();
	});

	it('should use provided cts and src', async () => {
		const key = await getTestKey();
		const cts = '2025-01-01T00:00:00.000Z';

		const signed = await signLabel(
			{ uri: 'did:plc:target', val: 'spam', cts, src: 'did:plc:other' },
			TEST_DID,
			key,
		);

		expect(signed.cts).toBe(cts);
		expect(signed.src).toBe('did:plc:other');
	});

	it('should produce consistent label fields for the same input', async () => {
		const key = await getTestKey();
		const cts = '2025-01-01T00:00:00.000Z';
		const data = { uri: 'did:plc:target', val: 'spam', cts };

		const signed1 = await signLabel(data, TEST_DID, key);
		const signed2 = await signLabel(data, TEST_DID, key);

		// label fields should be identical
		expect(signed1.src).toBe(signed2.src);
		expect(signed1.uri).toBe(signed2.uri);
		expect(signed1.val).toBe(signed2.val);
		expect(signed1.neg).toBe(signed2.neg);
		expect(signed1.cts).toBe(signed2.cts);

		// both signatures should be valid 64-byte compact signatures
		expect(signed1.sig.byteLength).toBe(64);
		expect(signed2.sig.byteLength).toBe(64);
	});

	it('should include optional fields when provided', async () => {
		const key = await getTestKey();

		const signed = await signLabel(
			{
				uri: 'at://did:plc:target/app.bsky.feed.post/abc',
				val: 'nudity',
				cid: 'bafyreib2rxk3rybk3aobmv5cjuql3setrnhfekwxbdmg7il4q2hr3hilqe',
				neg: true,
				exp: '2026-01-01T00:00:00.000Z',
			},
			TEST_DID,
			key,
		);

		expect(signed.cid).toBe('bafyreib2rxk3rybk3aobmv5cjuql3setrnhfekwxbdmg7il4q2hr3hilqe');
		expect(signed.neg).toBe(true);
		expect(signed.exp).toBe('2026-01-01T00:00:00.000Z');
	});
});

describe('formatLabel', () => {
	it('should convert sig to Bytes wrapper and set ver to 1', () => {
		const saved: SavedLabel = {
			seq: 1,
			src: TEST_DID,
			uri: 'did:plc:target',
			val: 'spam',
			neg: false,
			cts: '2025-01-01T00:00:00.000Z',
			sig: new Uint8Array(64),
		};

		const formatted = formatLabel(saved);

		expect(formatted.ver).toBe(1);
		expect(formatted.src).toBe(TEST_DID);
		expect(isBytes(formatted.sig)).toBe(true);
		expect(fromBytes(formatted.sig)).toEqual(saved.sig);
	});

	it('should include optional fields when present', () => {
		const saved: SavedLabel = {
			seq: 1,
			src: TEST_DID,
			uri: 'at://did:plc:target/app.bsky.feed.post/abc',
			val: 'nudity',
			neg: true,
			cts: '2025-01-01T00:00:00.000Z',
			cid: 'bafyreib2rxk3rybk3aobmv5cjuql3setrnhfekwxbdmg7il4q2hr3hilqe',
			exp: '2026-01-01T00:00:00.000Z',
			sig: new Uint8Array(64),
		};

		const formatted = formatLabel(saved);

		expect(formatted.cid).toBe(saved.cid);
		expect(formatted.exp).toBe(saved.exp);
		expect(formatted.neg).toBe(true);
	});

	it('should omit optional fields when absent', () => {
		const saved: SavedLabel = {
			seq: 1,
			src: TEST_DID,
			uri: 'did:plc:target',
			val: 'spam',
			neg: false,
			cts: '2025-01-01T00:00:00.000Z',
			sig: new Uint8Array(64),
		};

		const formatted = formatLabel(saved);

		expect('cid' in formatted).toBe(false);
		expect('exp' in formatted).toBe(false);
	});
});
