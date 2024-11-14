import '@atcute/bluesky/lexicons';
import type { AppBskyRichtextFacet } from '@atcute/client/lexicons';

type UnwrapArray<T> = T extends (infer V)[] ? V : never;

export type Facet = AppBskyRichtextFacet.Main;
export type FacetFeature = UnwrapArray<Facet['features']>;

export interface RichtextSegment {
	text: string;
	features: FacetFeature[] | undefined;
}

const segment = (
	text: string,
	features: FacetFeature[] | undefined,
): RichtextSegment => ({
	text,
	features: text.length > 0 ? features : undefined,
});

export const segmentize = (
	text: string,
	facets: Facet[] | undefined,
): RichtextSegment[] => {
	if (!facets?.length) return [segment(text, undefined)];

	const segments: RichtextSegment[] = [];
	const utf16Length = text.length;
	let utf16Cursor = 0;
	let utf8Cursor = 0;

	const advanceCursor = (startUtf16: number, endUtf8: number): number => {
		let curs = startUtf16;

		// Check if we should use multi-byte path
		const firstChar = text.charCodeAt(curs);
		const isMultiByte = firstChar >= 0x80;

		if (!isMultiByte) {
			// SIMD-like batch processing for ASCII sections
			while (utf8Cursor + 8 <= endUtf8 && curs + 8 <= utf16Length) {
				const char1 = text.charCodeAt(curs);
				const char2 = text.charCodeAt(curs + 1);
				const char3 = text.charCodeAt(curs + 2);
				const char4 = text.charCodeAt(curs + 3);
				const char5 = text.charCodeAt(curs + 4);
				const char6 = text.charCodeAt(curs + 5);
				const char7 = text.charCodeAt(curs + 6);
				const char8 = text.charCodeAt(curs + 7);

				// Fast ASCII check using bitwise OR
				if (
					(char1 | char2 | char3 | char4 | char5 | char6 | char7 | char8) < 0x80
				) {
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

			// Fast ASCII path
			if (code < 0x80) {
				curs++;
				utf8Cursor++;
				continue;
			}

			// Multi-byte path - unified handling
			if (code < 0x800) {
				curs++;
				utf8Cursor += 2;
			} else if (code < 0xD800 || code > 0xDBFF) {
				curs++;
				utf8Cursor += 3;
			} else {
				curs += 2;
				utf8Cursor += 4;
			}
		}

		return curs;
	};

	// Pre-filter valid facets
	const validFacets = facets.filter((facet) => {
		const byteStart = facet.index.byteStart;
		const byteEnd = facet.index.byteEnd;
		return byteEnd > byteStart && facet.features.length > 0;
	});

	// Process facets
	for (const facet of validFacets) {
		const { byteStart, byteEnd } = facet.index;
		const { features } = facet;

		if (utf8Cursor < byteStart) {
			const nextUtf16Cursor = advanceCursor(utf16Cursor, byteStart);
			if (nextUtf16Cursor > utf16Cursor) {
				segments.push(
					segment(text.slice(utf16Cursor, nextUtf16Cursor), undefined),
				);
			}
			utf16Cursor = nextUtf16Cursor;
		}

		const nextUtf16Cursor = advanceCursor(utf16Cursor, byteEnd);
		if (nextUtf16Cursor > utf16Cursor) {
			segments.push(
				segment(text.slice(utf16Cursor, nextUtf16Cursor), features),
			);
		}
		utf16Cursor = nextUtf16Cursor;
	}

	// Handle remaining text
	if (utf16Cursor < utf16Length) {
		segments.push(segment(text.slice(utf16Cursor), undefined));
	}

	return segments;
};
