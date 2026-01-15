import { expect, expectTypeOf, it } from 'vitest';
import type { AppBskyRichtextFacet } from '@atcute/bluesky';
import { segmentize, type Facet, type RichtextSegment } from './index.js';

it('does utf8 slicing', () => {
	expect(
		segmentize('one👨‍👩‍👧‍👧 two👨‍👩‍👧‍👧 three👨‍👩‍👧‍👧 ', [
			{
				index: { byteStart: 0, byteEnd: 28 },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '' }],
			},
			{
				index: { byteStart: 29, byteEnd: 57 },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '' }],
			},
			{
				index: { byteStart: 58, byteEnd: 88 },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '' }],
			},
		]),
	).toEqual([
		{
			text: 'one👨‍👩‍👧‍👧',
			features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '' }],
		},
		{
			text: ' ',
			features: undefined,
		},
		{
			text: 'two👨‍👩‍👧‍👧',
			features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '' }],
		},
		{
			text: ' ',
			features: undefined,
		},
		{
			text: 'three👨‍👩‍👧‍👧',
			features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '' }],
		},
		{
			text: ' ',
			features: undefined,
		},
	]);
});

it('does not allow end<start', () => {
	expect(
		segmentize('abcd', [
			{
				index: { byteEnd: 2, byteStart: 4 },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '' }],
			},
		]),
	).toEqual([
		{
			text: 'abcd',
			features: undefined,
		},
	]);
});

type BlueskyFeature = AppBskyRichtextFacet.Main['features'][number];

it('infers feature type from facets', () => {
	const facets: AppBskyRichtextFacet.Main[] = [];
	const result = segmentize('hello', facets);

	expectTypeOf(result).toEqualTypeOf<RichtextSegment<BlueskyFeature>[]>();
});

it('works with custom feature types', () => {
	interface CustomFeature {
		$type: 'custom#feature';
		value: number;
	}

	const facets: Facet<CustomFeature>[] = [
		{ index: { byteStart: 0, byteEnd: 5 }, features: [{ $type: 'custom#feature', value: 42 }] },
	];
	const result = segmentize('hello', facets);

	expectTypeOf(result).toEqualTypeOf<RichtextSegment<CustomFeature>[]>();
});

it('returns unknown feature type when facets is undefined', () => {
	const result = segmentize('hello', undefined);

	expectTypeOf(result).toEqualTypeOf<RichtextSegment<unknown>[]>();
});

it('accepts bluesky facets as compatible with Facet interface', () => {
	expectTypeOf<AppBskyRichtextFacet.Main>().toExtend<Facet<BlueskyFeature>>();
});
