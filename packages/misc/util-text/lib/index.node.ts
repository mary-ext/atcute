import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { arch, platform } from 'node:process';

import {
	getGraphemeLength as getGraphemeLengthJs,
	isGraphemeLengthInRange as isGraphemeLengthInRangeJs,
} from './index.ts';
import { isAsciiWithoutCr } from './utils.ts';

type GraphemeBinding = {
	getGraphemeLength: (str: string) => number;
	isGraphemeLengthInRange: (str: string, min: number, max: number) => boolean;
};

/**
 * whether the native module is available for the current runtime.
 * @internal
 */
export let hasNative = false;

/**
 * returns the grapheme length of a string
 * @param text string to count graphemes in
 * @returns grapheme count
 */
export let getGraphemeLength: (text: string) => number = getGraphemeLengthJs;

/**
 * checks if the grapheme length of a string is within the specified range
 * @param text string to check
 * @param min minimum grapheme length (inclusive)
 * @param max maximum grapheme length (inclusive)
 * @returns true if the grapheme length is within range
 */
export let isGraphemeLengthInRange: (text: string, min: number, max: number) => boolean =
	isGraphemeLengthInRangeJs;

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
	const binding: GraphemeBinding = require(`../prebuilds/${getPrebuildDir()}/grapheme.node`);

	const nativeGetGraphemeLength = binding.getGraphemeLength;
	const nativeIsGraphemeLengthInRange = binding.isGraphemeLengthInRange;

	getGraphemeLength = (text) => {
		if (isAsciiWithoutCr(text)) {
			return text.length;
		}
		return nativeGetGraphemeLength(text);
	};

	isGraphemeLengthInRange = (text, min, max) => {
		const utf16Len = text.length;

		if (utf16Len < min) {
			return false;
		}
		if (min === 0 && utf16Len <= max) {
			return true;
		}
		if (isAsciiWithoutCr(text)) {
			return utf16Len <= max;
		}

		return nativeIsGraphemeLengthInRange(text, min, max);
	};

	hasNative = true;
} catch {}
