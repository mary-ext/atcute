import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { arch, platform } from 'node:process';

const segmenter = new Intl.Segmenter();

type GraphemeBinding = {
	getGraphemeLength: (str: string) => number;
	isGraphemeLengthInRange: (str: string, min: number, max: number) => boolean;
};

/**
 * whether the native module is available for the current runtime.
 */
export let hasNative = false;

let nativeGetGraphemeLength: ((str: string) => number) | null = null;
let nativeIsGraphemeLengthInRange: ((str: string, min: number, max: number) => boolean) | null = null;

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

	nativeGetGraphemeLength = binding.getGraphemeLength;
	nativeIsGraphemeLengthInRange = binding.isGraphemeLengthInRange;
	hasNative = true;
} catch {}

const isAsciiWithoutCr = (text: string): boolean => {
	const len = text.length;
	let idx = 0;

	while (idx + 3 < len) {
		const a = text.charCodeAt(idx);
		const b = text.charCodeAt(idx + 1);
		const c = text.charCodeAt(idx + 2);
		const d = text.charCodeAt(idx + 3);

		if ((a | b | c | d) > 0x7f || a === 0x0d || b === 0x0d || c === 0x0d || d === 0x0d) {
			return false;
		}

		idx += 4;
	}

	while (idx < len) {
		const code = text.charCodeAt(idx);
		if (code > 0x7f || code === 0x0d) {
			return false;
		}

		idx++;
	}

	return true;
};

/**
 * returns the grapheme length of a string
 * @param text string to count graphemes in
 * @returns grapheme count
 */
export const getGraphemeLength = (text: string): number => {
	if (isAsciiWithoutCr(text)) {
		return text.length;
	}

	// native module handles non-ASCII much faster than Intl.Segmenter
	if (nativeGetGraphemeLength !== null) {
		return nativeGetGraphemeLength(text);
	}

	const iterator = segmenter.segment(text)[Symbol.iterator]();
	let count = 0;

	while (!iterator.next().done) {
		count++;
	}

	return count;
};

/**
 * checks if the grapheme length of a string is within the specified range
 * @param text string to check
 * @param min minimum grapheme length (inclusive)
 * @param max maximum grapheme length (inclusive)
 * @returns true if the grapheme length is within range
 */
export const isGraphemeLengthInRange = (text: string, min: number, max: number): boolean => {
	const utf16Len = text.length;

	// UTF-16 length < min means grapheme count < min
	if (utf16Len < min) {
		return false;
	}

	// if there's no minimum constraint and UTF-16 length is within max,
	// grapheme count is definitely within max
	if (min === 0 && utf16Len <= max) {
		return true;
	}

	if (isAsciiWithoutCr(text)) {
		return utf16Len <= max;
	}

	// native module handles non-ASCII much faster
	if (nativeIsGraphemeLengthInRange !== null) {
		return nativeIsGraphemeLengthInRange(text, min, max);
	}

	// count graphemes with early termination
	const iterator = segmenter.segment(text)[Symbol.iterator]();
	let count = 0;

	while (!iterator.next().done) {
		count++;
		if (count > max) {
			return false;
		}
	}

	return count >= min;
};
