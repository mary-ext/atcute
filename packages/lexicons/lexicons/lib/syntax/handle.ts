/**
 * represents an account's handle, using domains as a human-friendly
 * identifier.
 */
export type Handle = `${string}.${string}`;

const isAlpha = (c: number) => (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a);
const isAlphaNum = (c: number) => isAlpha(c) || (c >= 0x30 && c <= 0x39);

// validates a domain label: starts/ends with alphanumeric, middle allows hyphens, max 63 chars
const isValidLabel = (input: string, start: number, end: number): boolean => {
	const len = end - start;
	if (len === 0 || len > 63) {
		return false;
	}

	const first = input.charCodeAt(start);
	if (!isAlphaNum(first)) {
		return false;
	}

	if (len > 1) {
		if (!isAlphaNum(input.charCodeAt(end - 1))) return false;
		for (let j = start + 1; j < end - 1; j++) {
			const c = input.charCodeAt(j);
			if (!isAlphaNum(c) && c !== 0x2d) {
				return false;
			}
		}
	}

	return true;
};

// #__NO_SIDE_EFFECTS__
export const isHandle = (input: unknown): input is Handle => {
	if (typeof input !== 'string') {
		return false;
	}

	const len = input.length;
	if (len < 3 || len > 253) {
		return false;
	}

	let labelStart = 0;
	let labelCount = 0;
	let lastLabelStart = 0;

	for (let i = 0; i <= len; i++) {
		if (i === len || input.charCodeAt(i) === 0x2e) {
			if (!isValidLabel(input, labelStart, i)) {
				return false;
			}
			lastLabelStart = labelStart;
			labelStart = i + 1;
			labelCount++;
		}
	}

	// need at least 2 labels (one dot)
	if (labelCount < 2) {
		return false;
	}

	// TLD must start with a letter
	return isAlpha(input.charCodeAt(lastLabelStart));
};
