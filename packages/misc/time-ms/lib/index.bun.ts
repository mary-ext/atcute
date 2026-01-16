import { dlopen, ptr } from 'bun:ffi';

const CLOCK_REALTIME = 0;

// 100-nanosecond intervals between 1601-01-01 and 1970-01-01
const EPOCH_OFFSET = 116444736000000000n;

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
	if (process.platform === 'win32') {
		const lib = dlopen('kernel32.dll', {
			GetSystemTimePreciseAsFileTime: { args: ['pointer'], returns: 'void' },
		});

		// FILETIME: { dwLowDateTime: u32, dwHighDateTime: u32 } = 8 bytes
		const buf = new Uint32Array(2);
		const bufPtr = ptr(buf);

		now = (): number => {
			lib.symbols.GetSystemTimePreciseAsFileTime(bufPtr);
			const low = BigInt(buf[0]);
			const high = BigInt(buf[1]);
			const filetime = (high << 32n) | low;
			// convert from 100-nanosecond intervals since 1601 to microseconds since 1970
			return Number((filetime - EPOCH_OFFSET) / 10n);
		};

		hasNative = true;
	} else {
		const libPath = process.platform === 'darwin' ? 'libSystem.B.dylib' : 'libc.so.6';

		const lib = dlopen(libPath, {
			clock_gettime: { args: ['i32', 'pointer'], returns: 'i32' },
		});

		// timespec: { tv_sec: i64, tv_nsec: i64 } = 16 bytes on 64-bit
		const buf = new BigInt64Array(2);
		const bufPtr = ptr(buf);

		now = (): number => {
			lib.symbols.clock_gettime(CLOCK_REALTIME, bufPtr);
			const sec = buf[0];
			const nsec = buf[1];
			return Number(sec * 1_000_000n + nsec / 1_000n);
		};

		hasNative = true;
	}
} catch {
	// ffi unavailable, keep fallback
}
