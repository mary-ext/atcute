import { s32decode, s32encode } from './s32.js';

let lastTimestamp: number = 0;

const TID_RE = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;

/**
 * Creates a TID based off provided timestamp and clockid, with no validation.
 */
export const createRaw = (timestamp: number, clockid: number): string => {
	return s32encode(timestamp).padStart(11, '2') + s32encode(clockid).padStart(2, '2');
};

/**
 * Creates a TID based off provided timestamp and clockid
 */
export const create = (timestamp: number, clockid: number): string => {
	if (timestamp < 0 || !Number.isSafeInteger(timestamp)) {
		throw new Error(`invalid timestamp`);
	}

	if (clockid < 0 || clockid > 1023) {
		throw new Error(`invalid clockid`);
	}

	return createRaw(timestamp, clockid);
};

/**
 * Return a TID based on current time
 */
export const now = (): string => {
	// we need these two aspects, which Date.now() doesn't provide:
	// - monotonically increasing time
	// - microsecond precision

	// while `performance.timeOrigin + performance.now()` could be used here, they
	// seem to have cross-browser differences, not sure on that yet.

	// deno-lint-ignore prefer-const
	let id = Math.floor(Math.random() * 1023);
	let timestamp = Math.max(Date.now() * 1_000, lastTimestamp);

	if (timestamp === lastTimestamp) {
		timestamp += 1;
	}

	lastTimestamp = timestamp;

	return createRaw(timestamp, id);
};

/**
 * Parses a TID, throws on invalid strings.
 */
export const parse = (tid: string): { timestamp: number; clockid: number } => {
	if (!validate(tid)) {
		throw new Error(`invalid TID`);
	}

	const timestamp = s32decode(tid.slice(0, 11));
	const clockid = s32decode(tid.slice(11, 13));

	return { timestamp: timestamp, clockid: clockid };
};

/**
 * Validate if string is a valid TID
 */
export const validate = (tid: string): boolean => {
	return tid.length === 13 && TID_RE.test(tid);
};
