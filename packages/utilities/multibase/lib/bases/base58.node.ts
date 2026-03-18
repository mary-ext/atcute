import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { arch, platform } from 'node:process';

import { createBtcBaseDecode, createBtcBaseEncode } from '../utils.ts';

const BASE58BTC_CHARSET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

type Base58Binding = {
	encode: (source: Uint8Array) => string;
	decode: (source: string) => Uint8Array<ArrayBuffer>;
};

/**
 * whether the native base58 module is available for the current runtime.
 * @internal
 */
export let hasNative = false;

/**
 * decodes a base58btc string to a Uint8Array
 * @param source base58btc encoded string
 * @returns decoded buffer
 */
export let fromBase58Btc: (source: string) => Uint8Array<ArrayBuffer> =
	/*#__PURE__*/ createBtcBaseDecode(BASE58BTC_CHARSET);

/**
 * encodes a Uint8Array to a base58btc string
 * @param source source buffer
 * @returns base58btc encoded string
 */
export let toBase58Btc: (source: Uint8Array) => string = /*#__PURE__*/ createBtcBaseEncode(BASE58BTC_CHARSET);

try {
	const getPrebuildDir = (): string => {
		if (platform === 'linux') {
			const ldd = readFileSync('/usr/bin/ldd', 'utf-8');
			const libc = ldd.includes('musl') ? 'musl' : ldd.includes('GNU C Library') ? 'glibc' : null;
			if (libc === null) {
				throw new Error(`unable to detect libc`);
			}
			return `${platform}-${arch}-${libc}`;
		}
		return `${platform}-${arch}`;
	};

	const require = createRequire(import.meta.url);
	const binding: Base58Binding = require(`../../prebuilds/${getPrebuildDir()}/base58.node`);

	fromBase58Btc = binding.decode;
	toBase58Btc = binding.encode;

	hasNative = true;
} catch {}
