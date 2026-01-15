export interface Facet<F = unknown> {
	index: { byteStart: number; byteEnd: number };
	features: F[];
}

export interface RichtextSegment<F = unknown> {
	text: string;
	features: F[] | undefined;
}

const segment = <F>(text: string, features: F[] | undefined): RichtextSegment<F> => {
	return { text, features: text.length > 0 ? features : undefined };
};

export const segmentize = <F>(text: string, facets: Facet<F>[] | undefined): RichtextSegment<F>[] => {
	if (facets === undefined || facets.length === 0) {
		return [segment(text, undefined)];
	}

	const segments: RichtextSegment<F>[] = [];
	const utf16Length = text.length;
	let utf16Cursor = 0;
	let utf8Cursor = 0;

	const advanceCursor = (startUtf16: number, endUtf8: number): number => {
		let curs = startUtf16;

		// Fast-path for entirely ASCII text
		const isLikelyAsciiText = text.charCodeAt(curs) < 0x80;
		if (isLikelyAsciiText) {
			curs += 1;
			utf8Cursor += 1;

			// SIMD-like batch processing
			while (utf8Cursor + 8 <= endUtf8 && curs + 8 <= utf16Length) {
				const char1 = text.charCodeAt(curs);
				const char2 = text.charCodeAt(curs + 1);
				const char3 = text.charCodeAt(curs + 2);
				const char4 = text.charCodeAt(curs + 3);
				const char5 = text.charCodeAt(curs + 4);
				const char6 = text.charCodeAt(curs + 5);
				const char7 = text.charCodeAt(curs + 6);
				const char8 = text.charCodeAt(curs + 7);

				if ((char1 | char2 | char3 | char4 | char5 | char6 | char7 | char8) < 0x80) {
					curs += 8;
					utf8Cursor += 8;
					continue;
				}

				break;
			}
		}

		// Process remaining characters individually
		while (utf8Cursor < endUtf8 && curs < utf16Length) {
			const code = text.charCodeAt(curs);

			if (code < 0x80) {
				curs += 1;
				utf8Cursor += 1;
			} else if (code < 0x800) {
				curs += 1;
				utf8Cursor += 2;
			} else if (code < 0xd800 || code > 0xdbff) {
				curs += 1;
				utf8Cursor += 3;
			} else {
				curs += 2;
				utf8Cursor += 4;
			}
		}

		return curs;
	};

	// Process facets
	for (let idx = 0, len = facets.length; idx < len; idx++) {
		const facet = facets[idx];

		const { byteStart, byteEnd } = facet.index;
		const features = facet.features;

		if (byteStart > byteEnd || features.length === 0) {
			continue;
		}

		if (utf8Cursor < byteStart) {
			const nextUtf16Cursor = advanceCursor(utf16Cursor, byteStart);
			if (nextUtf16Cursor > utf16Cursor) {
				segments.push(segment(text.slice(utf16Cursor, nextUtf16Cursor), undefined));
			}

			utf16Cursor = nextUtf16Cursor;
		}

		{
			const nextUtf16Cursor = advanceCursor(utf16Cursor, byteEnd);
			if (nextUtf16Cursor > utf16Cursor) {
				segments.push(segment(text.slice(utf16Cursor, nextUtf16Cursor), features));
			}

			utf16Cursor = nextUtf16Cursor;
		}
	}

	// Handle remaining text
	if (utf16Cursor < utf16Length) {
		segments.push(segment(text.slice(utf16Cursor), undefined));
	}

	return segments;
};
