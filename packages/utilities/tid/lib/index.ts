import { now as getNow } from '@atcute/time-ms';

import { random } from '#platform/random';

import { S32_2CHAR_TABLE, s32decode, s32encode } from './s32.ts';

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
	if (!validate(tid)) {
		throw new Error(`invalid TID`);
	}

	const timestamp = s32decode(tid, 0, 11);
	const clockid = s32decode(tid, 11, 2);

	return { timestamp, clockid };
};

/**
 * Validate if string is a valid TID
 */
export const validate = (tid: string): boolean => {
	return tid.length === 13 && TID_RE.test(tid);
};
