import { isNsid } from '@atcute/lexicons/syntax';

/**
 * checks whether a string is either a valid NSID or a wildcard pattern that ends with `.*` whose prefix is a
 * valid NSID segment.
 */
export const isValidLexiconPattern = (pattern: string): boolean => {
	if (pattern.endsWith('.*')) {
		return isNsid(`${pattern.slice(0, -2)}.x`);
	}
	return isNsid(pattern);
};
