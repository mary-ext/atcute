/**
 * represents a record key
 */
export type RecordKey = string;

const isAlpha = (c: number) => (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a);
const isAlphaNum = (c: number) => isAlpha(c) || (c >= 0x30 && c <= 0x39);

// #__NO_SIDE_EFFECTS__
export const isRecordKey = (input: unknown): input is RecordKey => {
	if (typeof input !== 'string') {
		return false;
	}

	const len = input.length;
	if (len < 1 || len > 512) {
		return false;
	}

	// reject "." and ".."
	if (len <= 2 && input.charCodeAt(0) === 0x2e && (len === 1 || input.charCodeAt(1) === 0x2e)) {
		return false;
	}

	for (let i = 0; i < len; i++) {
		const c = input.charCodeAt(i);
		// [a-zA-Z0-9_~.:-]
		if (
			!isAlphaNum(c) &&
			c !== 0x5f && // _
			c !== 0x7e && // ~
			c !== 0x2e && // .
			c !== 0x3a && // :
			c !== 0x2d // -
		) {
			return false;
		}
	}

	return true;
};
