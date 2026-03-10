import { createRequire } from 'node:module';
import { arch, platform, report } from 'node:process';

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
	const getPrebuildDir = (): string => {
		if (platform === 'linux') {
			const header = (report.getReport() as Record<string, any>).header;
			const libc = header.glibcVersionRuntime ? 'glibc' : 'musl';
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
