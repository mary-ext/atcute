import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { arch, platform } from 'node:process';

type TimeBinding = {
	now: () => number;
};

/** whether the native module is available for the current runtime. */
export let hasNative = false;

/**
 * returns the current time in microseconds since unix epoch.
 *
 * @returns timestamp in microseconds
 */
export let now = (): number => {
	return Date.now() * 1_000;
};

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
	const binding: TimeBinding = require(`../prebuilds/${getPrebuildDir()}/time-ms.node`);

	now = (): number => {
		if (Date.isFake) {
			return Date.now() * 1_000;
		}

		return binding.now();
	};

	hasNative = true;
} catch {}
