import { createRequire } from 'node:module';
import { join } from 'node:path';

type TimeBinding = {
	now: () => number;
};

/**
 * whether the native module is available for the current runtime.
 */
export let hasNative = false;

/**
 * returns the current time in microseconds since unix epoch.
 * @returns timestamp in microseconds
 */
export let now = (): number => {
	return Date.now() * 1_000;
};

try {
	const require = createRequire(import.meta.url);
	const binding: TimeBinding = require('node-gyp-build')(join(import.meta.dirname, '..'));

	now = (): number => {
		if (Date.isFake) {
			return Date.now() * 1_000;
		}

		return binding.now();
	};

	hasNative = true;
} catch {}
