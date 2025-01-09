import { bench, do_not_optimize, run, summary } from 'mitata';

import { fromBase58Btc, toBase58Btc } from './base58.js';

summary(() => {
	bench('fromBase58Btc', () => {
		return do_not_optimize(fromBase58Btc(`UXE7GvtEk8XTXs1GF8HSGbVA9FCX9SEBPe`));
	});
});

summary(() => {
	bench('toBase58Btc', function* () {
		yield {
			[0]() {
				return Uint8Array.from([
					68, 101, 99, 101, 110, 116, 114, 97, 108, 105, 122, 101, 32, 101, 118, 101, 114, 121, 116, 104, 105,
					110, 103, 33, 33,
				]);
			},
			bench(bytes: Uint8Array) {
				return do_not_optimize(toBase58Btc(bytes));
			},
		};
	});
});

await run();
