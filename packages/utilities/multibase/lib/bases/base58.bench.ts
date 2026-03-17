import { bench, do_not_optimize, run, summary } from 'mitata';

import { fromBase58Btc as fromBase58BtcNode, toBase58Btc as toBase58BtcNode } from './base58.node.ts';
import { fromBase58Btc, toBase58Btc } from './base58.ts';

const cases = [
	{
		label: 'secp256k1 private multikey payload',
		values: Array.from({ length: 34 }, (_, idx) => (idx * 37 + 11) & 0xff),
	},
	{
		label: 'secp256k1 public multikey payload',
		values: Array.from({ length: 35 }, (_, idx) => (idx * 53 + 7) & 0xff),
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
