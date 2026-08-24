import { bench, do_not_optimize, run, summary } from 'mitata';

import { getOrderedObjectKeys } from './encode.ts';

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

const getWideObject = (size: number): Record<string, number> => {
	const entries: [string, number][] = [];
	for (let i = size - 1; i >= 0; i--) {
		entries.push([`key-${i.toString().padStart(5, '0')}`, i]);
	}

	return Object.fromEntries(entries);
};

function getKeysNaive(obj: Record<string, unknown>): string[] {
	return (
		Object.keys(obj)
			.filter((key) => obj[key] !== undefined)
			// oxlint-disable-next-line unicorn/no-array-sort -- filter already clones
			.sort((a, b) => a.length - b.length || (a < b ? -1 : 1))
	);
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

	bench('canonical key ordering', function* () {
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

for (const size of [128, 2_048]) {
	const object = getWideObject(size);

	summary(() => {
		bench(`native key filter+sort (${size} keys)`, () => {
			return do_not_optimize(getKeysNaive(object));
		});

		bench(`canonical key ordering (${size} keys)`, () => {
			return do_not_optimize(getOrderedObjectKeys(object));
		});
	});
}

await run();
