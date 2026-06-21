// every code point in U+0000..U+00FF is its own extended grapheme cluster: the range has no combining
// marks, ZWJ, regional indicators, Hangul jamo, or surrogate pairs, so no two adjacent code units ever
// join into one cluster. excluding CR avoids the lone exception, CRLF. so for such strings the grapheme
// count equals the UTF-16 length exactly, letting callers skip segmentation.
export const isLatin1WithoutCr = (text: string): boolean => {
	const len = text.length;
	let idx = 0;

	while (idx + 3 < len) {
		const a = text.charCodeAt(idx);
		const b = text.charCodeAt(idx + 1);
		const c = text.charCodeAt(idx + 2);
		const d = text.charCodeAt(idx + 3);

		if ((a | b | c | d) > 0xff || a === 0x0d || b === 0x0d || c === 0x0d || d === 0x0d) {
			return false;
		}

		idx += 4;
	}

	while (idx < len) {
		const code = text.charCodeAt(idx);
		if (code > 0xff || code === 0x0d) {
			return false;
		}

		idx++;
	}

	return true;
};
