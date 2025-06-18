const segmenter = new Intl.Segmenter();

export const isWithinUtf8Bounds = (input: string, min = 0, max = Infinity): 'max' | 'min' | undefined => {
	const utf16Len = input.length;
	const maybeUtf8Len = utf16Len * 3;

	// fail early if estimated upper bound is too small
	if (maybeUtf8Len < min) {
		return 'min';
	}

	// skip if UTF-16 length already satisfies both constraints
	if (utf16Len >= min && maybeUtf8Len <= max) {
		return undefined;
	}

	const utf8Len = getUtf8Length(input);

	if (utf8Len < min) {
		return 'min';
	}

	if (utf8Len > max) {
		return 'max';
	}

	return undefined;
};

export const isWithinGraphemeBounds = (input: string, min = 0, max = Infinity): 'max' | 'min' | undefined => {
	// grapheme conversion is expensive, so we're going to do some safe naive
	// checks where we assume 1 UTF-16 character = 1 grapheme.

	const utf16Len = input.length;

	// fail early if UTF-16 length is too small
	if (utf16Len < min) {
		return 'min';
	}

	// if there is no minimum bounds, we can safely skip when UTF-16 is
	// within the maximum bounds.
	if (min === 0 && utf16Len <= max) {
		return undefined;
	}

	const graphemeLen = getGraphemeLength(input);

	if (graphemeLen < min) {
		return 'min';
	}

	if (graphemeLen > max) {
		return 'max';
	}

	return undefined;
};

export const getUtf8Length = (str: string): number => {
	const len = str.length;

	let u16pos = 0;
	let u8pos = 0;

	jump: if (str.charCodeAt(0) < 0x80) {
		u16pos++;
		u8pos++;

		while (u16pos + 3 < len) {
			const a = str.charCodeAt(u16pos);
			const b = str.charCodeAt(u16pos + 1);
			const c = str.charCodeAt(u16pos + 2);
			const d = str.charCodeAt(u16pos + 3);

			if ((a | b | c | d) >= 0x80) {
				break jump;
			}

			u16pos += 4;
			u8pos += 4;
		}

		while (u16pos < len) {
			const x = str.charCodeAt(u16pos);

			if (x >= 0x80) {
				break jump;
			}

			u16pos++;
			u8pos++;
		}

		return u8pos;
	}

	while (u16pos < len) {
		const code = str.charCodeAt(u16pos);

		if (code < 0x80) {
			u16pos += 1;
			u8pos += 1;
		} else if (code < 0x800) {
			u16pos += 1;
			u8pos += 2;
		} else if (code < 0xd800 || code > 0xdbff) {
			u16pos += 1;
			u8pos += 3;
		} else {
			u16pos += 2;
			u8pos += 4;
		}
	}

	return u8pos;
};

export const getGraphemeLength = (text: string): number => {
	const iterator = segmenter.segment(text)[Symbol.iterator]();
	let count = 0;

	while (!iterator.next().done) {
		count++;
	}

	return count;
};
