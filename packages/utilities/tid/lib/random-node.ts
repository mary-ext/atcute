import { randomInt } from 'node:crypto';

/** returns a random integer in the range [0, max) */
export const random = (max: number): number => {
	return randomInt(max);
};
