import { InvalidMstKeyError } from './errors.ts';

const MST_KEY_RE = /^[a-zA-Z0-9_~.:-]+\/[a-zA-Z0-9_~.:-]+$/;

/**
 * checks if the string is a valid MST key
 * @param str the string to validate
 * @returns true if valid MST key format
 */
export const isMstKey = (str: string): boolean => {
	return str.length >= 3 && str.length <= 1024 && MST_KEY_RE.test(str);
};

/**
 * asserts that the string is a valid MST key
 * @param str the string to validate
 * @throws {InvalidMstKeyError} if the string is not a valid MST key
 */
export const assertMstKey = (str: string): void => {
	if (!isMstKey(str)) {
		throw new InvalidMstKeyError(str);
	}
};
