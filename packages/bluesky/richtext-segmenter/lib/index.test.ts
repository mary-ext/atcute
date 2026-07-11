import type { AppBskyRichtextFacet } from '@atcute/bluesky';

import { expect, expectTypeOf, it } from 'vitest';

import { type Facet, type RichtextSegment, segmentize } from './index.ts';

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

it('does not emit a segment for zero-length facets', () => {
	expect(
		segmentize('hello', [
			{
				index: { byteEnd: 2, byteStart: 2 },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '' }],
			},
		]),
	).toEqual([
		{
			text: 'he',
			features: undefined,
		},
		{
			text: 'llo',
			features: undefined,
		},
	]);
});

it('does not let overlapping facets steal characters past their end', () => {
	expect(
		segmentize('hello', [
			{
				index: { byteEnd: 4, byteStart: 0 },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'a' }],
			},
			{
				index: { byteEnd: 4, byteStart: 2 },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'b' }],
			},
		]),
	).toEqual([
		{
			text: 'hell',
			features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'a' }],
		},
		{
			text: 'o',
			features: undefined,
		},
	]);
});

it('does not overshoot the byte cursor on a lone high surrogate', () => {
	// a lone high surrogate is encoded as U+FFFD (3 bytes), not a 4-byte pair;
	// the facet covers the 'X' at byte offset 3
	expect(
		segmentize('\ud800X', [
			{
				index: { byteStart: 3, byteEnd: 4 },
				features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'x' }],
			},
		]),
	).toEqual([
		{
			text: '\ud800',
			features: undefined,
		},
		{
			text: 'X',
			features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'x' }],
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
