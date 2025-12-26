import { join } from 'node:path';

type TimeBinding = {
	now: () => number;
};

let binding: TimeBinding | null = null;

try {
	// node-gyp-build handles platform/arch detection, libc variants, etc.
	binding = require('node-gyp-build')(join(import.meta.dirname, '..')) as TimeBinding;
} catch {
	binding = null;
}

/**
 * whether the native module is available for the current runtime.
 */
export const hasNative = binding !== null;

/**
 * returns the current time in microseconds since unix epoch.
 * @returns timestamp in microseconds
 */
export const now = (): number => {
	if (binding === null) {
		return Date.now() * 1_000;
	}

	return binding.now();
};
