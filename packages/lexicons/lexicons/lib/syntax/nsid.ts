import { isAsciiAlpha, isAsciiAlphaNum } from './utils/ascii.ts';

/**
 * represents a namespace identifier (NSID)
 */
export type Nsid = `${string}.${string}.${string}`;

// #__NO_SIDE_EFFECTS__
export const isNsid = (input: unknown): input is Nsid => {
	if (typeof input !== 'string') {
		return false;
	}

	const len = input.length;
	if (len < 5 || len > 317) {
		return false;
	}

	// find the last dot to separate domain labels from the name segment
	let lastDot = -1;
	for (let j = len - 1; j >= 0; j--) {
		if (input.charCodeAt(j) === 0x2e) {
			lastDot = j;
			break;
		}
	}
	if (lastDot === -1) {
		return false;
	}

	// validate domain segments (before lastDot)
	let segStart = 0;
	let segIdx = 0;
	for (let i = 0; i <= lastDot; i++) {
		if (i === lastDot || input.charCodeAt(i) === 0x2e) {
			const segLen = i - segStart;
			if (segLen === 0 || segLen > 63) {
				return false;
			}

			const first = input.charCodeAt(segStart);
			if (segIdx === 0) {
				// first domain label must start with a letter
				if (!isAsciiAlpha(first)) {
					return false;
				}
			} else {
				// subsequent domain labels start with alphanumeric
				if (!isAsciiAlphaNum(first)) {
					return false;
				}
			}

			if (segLen > 1) {
				if (!isAsciiAlphaNum(input.charCodeAt(i - 1))) {
					return false;
				}
				for (let j = segStart + 1; j < i - 1; j++) {
					const c = input.charCodeAt(j);
					if (!isAsciiAlphaNum(c) && c !== 0x2d) {
						return false;
					}
				}
			}

			segStart = i + 1;
			segIdx++;
		}
	}

	// need at least 2 domain segments
	if (segIdx < 2) {
		return false;
	}

	// name segment (after lastDot): starts with letter, rest alphanumeric, max 63
	const nameStart = lastDot + 1;
	const nameLen = len - nameStart;
	if (nameLen === 0 || nameLen > 63) {
		return false;
	}

	if (!isAsciiAlpha(input.charCodeAt(nameStart))) {
		return false;
	}
	for (let j = nameStart + 1; j < len; j++) {
		if (!isAsciiAlphaNum(input.charCodeAt(j))) {
			return false;
		}
	}

	return true;
};
