import { now as getNow } from '@atcute/time-ms';

import { random } from '#platform/random';

import { S32_2CHAR_TABLE, S32_DECODE_TABLE, s32encode } from './s32.ts';

let lastTimestamp = 0;
let lastCurrentTime = 0;

const TID_RE = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;

/**
 * Creates a TID based off provided timestamp and clockid, with no validation.
 */
export const createRaw = (timestamp: number, clockid: number): string => {
	return s32encode(timestamp).padStart(11, '2') + S32_2CHAR_TABLE[clockid]!;
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
	const currentTime = getNow();
	let timestamp: number;

	if (currentTime === lastCurrentTime) {
		// same time; increment to avoid collision
		timestamp = lastTimestamp + 1;
	} else {
		// time changed
		timestamp = currentTime;
		lastCurrentTime = currentTime;
	}

	lastTimestamp = timestamp;
	return createRaw(timestamp, random(1024));
};

/**
 * Parses a TID, throws on invalid strings.
 */
export const parse = (tid: string): { timestamp: number; clockid: number } => {
	if (tid.length !== 13) {
		throw new Error(`invalid TID`);
	}

	let timestamp = 0;
	let clockid = 0;

	for (let idx = 0; idx < 13; idx++) {
		const code = tid.charCodeAt(idx);
		const value = code < S32_DECODE_TABLE.length ? S32_DECODE_TABLE[code]! : -1;

		if (value < 0 || (idx === 0 && value > 15)) {
			throw new Error(`invalid TID`);
		}

		if (idx < 11) {
			timestamp = timestamp * 32 + value;
		} else {
			clockid = clockid * 32 + value;
		}
	}

	return { timestamp, clockid };
};

/**
 * Validate if string is a valid TID
 */
export const validate = (tid: string): boolean => {
	return tid.length === 13 && TID_RE.test(tid);
};
