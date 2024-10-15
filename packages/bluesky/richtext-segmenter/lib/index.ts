import '@atcute/bluesky/lexicons';
import type { AppBskyRichtextFacet } from '@atcute/client/lexicons';

type UnwrapArray<T> = T extends (infer V)[] ? V : never;

export type Facet = AppBskyRichtextFacet.Main;
export type FacetFeature = UnwrapArray<Facet['features']>;

export interface RichtextSegment {
	text: string;
	features: FacetFeature[] | undefined;
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const slice = (bytes: Uint8Array, start?: number, end?: number) => {
	return decoder.decode(bytes.subarray(start, end));
};

const segment = (text: string, features: FacetFeature[] | undefined): RichtextSegment => {
	return { text: text, features: features };
};

export const segmentize = (text: string, facets: Facet[] | undefined): RichtextSegment[] => {
	if (facets === undefined || facets.length === 0) {
		return [segment(text, undefined)];
	}

	const bytes = encoder.encode(text);
	const length = bytes.byteLength;

	const segments: RichtextSegment[] = [];

	const facetsLength = facets.length;

	let textCursor = 0;
	let facetCursor = 0;

	do {
		const facet = facets[facetCursor];
		const { byteStart, byteEnd } = facet.index;

		if (textCursor < byteStart) {
			segments.push(segment(slice(bytes, textCursor, byteStart), undefined));
		} else if (textCursor > byteStart) {
			facetCursor++;
			continue;
		}

		if (byteStart < byteEnd) {
			const subtext = slice(bytes, byteStart, byteEnd);
			const features = facet.features;

			if (features.length === 0 || subtext.trim().length === 0) {
				segments.push(segment(subtext, undefined));
			} else {
				segments.push(segment(subtext, features));
			}
		}

		textCursor = byteEnd;
		facetCursor++;
	} while (facetCursor < facetsLength);

	if (textCursor < length) {
		segments.push(segment(slice(bytes, textCursor, length), undefined));
	}

	return segments;
};
