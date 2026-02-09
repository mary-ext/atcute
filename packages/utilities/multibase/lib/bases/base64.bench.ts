import { bench, do_not_optimize, run, summary } from 'mitata';

import { fromBase64 as fromBase64Node, toBase64 as toBase64Node } from './base64-node.ts';
import { fromBase64 as fromBase64Native, toBase64 as toBase64Native } from './base64-web-native.ts';
import { fromBase64 as fromBase64Polyfill, toBase64 as toBase64Polyfill } from './base64-web-polyfill.ts';

summary(() => {
	bench('Uint8Array.fromBase64', () => {
		return do_not_optimize(fromBase64Native('RGVjZW50cmFsaXplIGV2ZXJ5dGhpbmch'));
	});

	bench('Node.js Buffer#from', () => {
		return do_not_optimize(fromBase64Node('RGVjZW50cmFsaXplIGV2ZXJ5dGhpbmch'));
	});

	bench('fromBase64 polyfill', () => {
		return do_not_optimize(fromBase64Polyfill('RGVjZW50cmFsaXplIGV2ZXJ5dGhpbmch'));
	});
});

summary(() => {
	bench('Uint8Array#toBase64', function* () {
		yield {
			[0]() {
				return Uint8Array.from([
					68, 101, 99, 101, 110, 116, 114, 97, 108, 105, 122, 101, 32, 101, 118, 101, 114, 121, 116, 104, 105,
					110, 103, 33,
				]);
			},
			bench(bytes: Uint8Array) {
				return do_not_optimize(toBase64Native(bytes));
			},
		};
	});

	bench('Node.js Buffer#toString', function* () {
		yield {
			[0]() {
				return Uint8Array.from([
					68, 101, 99, 101, 110, 116, 114, 97, 108, 105, 122, 101, 32, 101, 118, 101, 114, 121, 116, 104, 105,
					110, 103, 33,
				]);
			},
			bench(bytes: Uint8Array) {
				return do_not_optimize(toBase64Node(bytes));
			},
		};
	});

	bench('toBase64 polyfill', function* () {
		yield {
			[0]() {
				return Uint8Array.from([
					68, 101, 99, 101, 110, 116, 114, 97, 108, 105, 122, 101, 32, 101, 118, 101, 114, 121, 116, 104, 105,
					110, 103, 33,
				]);
			},
			bench(bytes: Uint8Array) {
				return do_not_optimize(toBase64Polyfill(bytes));
			},
		};
	});
});

await run();
