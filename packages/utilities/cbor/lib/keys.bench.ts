import { bench, run, summary, do_not_optimize } from 'mitata';
import { getOrderedObjectKeys } from './encode.js';

const getObject = () => ({
	$type: 'app.bsky.feed.post',
	createdAt: '2024-10-19T14:13:59.355Z',
	facets: [
		{
			features: [
				{
					$type: 'app.bsky.richtext.facet#link',
					uri: 'https://github.com/mary-ext/atcute',
				},
			],
			index: {
				byteEnd: 18,
				byteStart: 12,
			},
		},
	],
	langs: ['en'],
	text: "introducing atcute, a collection of lightweight TypeScript packages for AT Protocol\n\nAPI client, OAuth client, utility packages for various data formats, Bluesky-specific utility packages for rich text and posting\n\nthey're all covered!",
});

function getKeysNaive(obj: Record<string, unknown>): string[] {
	return Object.keys(obj)
		.filter((key) => obj[key] !== undefined)
		.sort((a, b) => a.length - b.length || (a < b ? -1 : 1));
}

summary(() => {
	bench('native key filter+sort', function* () {
		yield {
			[0]() {
				return getObject();
			},
			bench(obj: Record<string, unknown>) {
				return do_not_optimize(getKeysNaive(obj));
			},
		};
	});

	bench('insertion sort + embedded key filtering', function* () {
		yield {
			[0]() {
				return getObject();
			},
			bench(obj: Record<string, unknown>) {
				return do_not_optimize(getOrderedObjectKeys(obj));
			},
		};
	});
});

await run();
