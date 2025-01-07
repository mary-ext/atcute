import { bench, do_not_optimize, run, summary } from 'mitata';

import { fromBase64 as _fromBase64Node, toBase64 as _toBase64Node } from './base64-node.js';
import { _fromBase64Native, _fromBase64Polyfill, _toBase64Native, _toBase64Polyfill } from './base64-web.js';

summary(() => {
	bench('Uint8Array.fromBase64', () => {
		return do_not_optimize(_fromBase64Native('RGVjZW50cmFsaXplIGV2ZXJ5dGhpbmch'));
	});

	bench('Node.js Buffer#from', () => {
		return do_not_optimize(_fromBase64Node('RGVjZW50cmFsaXplIGV2ZXJ5dGhpbmch'));
	});

	bench('fromBase64 polyfill', () => {
		return do_not_optimize(_fromBase64Polyfill('RGVjZW50cmFsaXplIGV2ZXJ5dGhpbmch'));
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
				return do_not_optimize(_toBase64Native(bytes));
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
				return do_not_optimize(_toBase64Node(bytes));
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
				return do_not_optimize(_toBase64Polyfill(bytes));
			},
		};
	});
});

await run();
