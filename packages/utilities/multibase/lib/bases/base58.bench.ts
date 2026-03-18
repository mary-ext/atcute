import { bench, do_not_optimize, run, summary } from 'mitata';

import { fromBase58Btc as fromBase58BtcNode, toBase58Btc as toBase58BtcNode } from './base58.node.ts';
import { fromBase58Btc, toBase58Btc } from './base58.ts';

// base58 is used for did:key multibase strings:
// - decode: parsing `z`-prefixed base58btc from DID documents
// - encode: creating multikey strings (2-byte prefix + key bytes)
// all key types (secp256k1, p256, ed25519) are 34-35 bytes
const cases = [
	{
		label: 'public multikey (35 bytes)',
		values: Array.from({ length: 35 }, (_, idx) => (idx * 53 + 7) & 0xff),
	},
	{
		// leading zeros map to '1' chars, exercising the prefix-handling path
		label: 'leading zeros (8 zeros + 27 bytes)',
		values: [
			...Array.from({ length: 8 }, () => 0),
			...Array.from({ length: 27 }, (_, idx) => (idx * 17 + 5) & 0xff),
		],
	},
];

for (const item of cases) {
	const bytes = Uint8Array.from(item.values);
	const encoded = toBase58Btc(bytes);

	summary(() => {
		bench(`fromBase58Btc js ${item.label}`, function* () {
			yield {
				[0]() {
					return encoded;
				},
				bench(encoded: string) {
					return do_not_optimize(fromBase58Btc(encoded));
				},
			};
		});

		bench(`fromBase58Btc node ${item.label}`, function* () {
			yield {
				[0]() {
					return encoded;
				},
				bench(encoded: string) {
					return do_not_optimize(fromBase58BtcNode(encoded));
				},
			};
		});
	});

	summary(() => {
		bench(`toBase58Btc js ${item.label}`, function* () {
			yield {
				[0]() {
					return Uint8Array.from(item.values);
				},
				bench(bytes: Uint8Array) {
					return do_not_optimize(toBase58Btc(bytes));
				},
			};
		});

		bench(`toBase58Btc node ${item.label}`, function* () {
			yield {
				[0]() {
					return Uint8Array.from(item.values);
				},
				bench(bytes: Uint8Array) {
					return do_not_optimize(toBase58BtcNode(bytes));
				},
			};
		});
	});
}

await run();
