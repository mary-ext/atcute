import { expect, it } from 'bun:test';
import { segmentize } from './index.js';

it('does utf8 slicing', () => {
	expect(
		segmentize('one👨‍👩‍👧‍👧 two👨‍👩‍👧‍👧 three👨‍👩‍👧‍👧', [
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
	]);
});
