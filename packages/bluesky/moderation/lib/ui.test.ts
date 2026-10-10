import type { Did } from '@atcute/lexicons';

import { describe, expect, it } from 'vitest';

import * as mock from './_test-util/mock.ts';
import {
	DisplayContext,
	type DisplayRestrictions,
	type ModerationOptions,
	getDisplayRestrictions,
	mergeDisplayRestrictions,
	moderatePost,
} from './index.ts';

const LABELER_DID: Did = 'did:web:labeler.test';

const opts: ModerationOptions = {
	viewerDid: 'did:web:alice.test',
	prefs: {
		adultContentEnabled: true,
		globalLabelPrefs: {},
		prefsByLabelers: {
			[LABELER_DID]: {
				labelPrefs: {},
			},
		},
		keywordFilters: [],
		temporaryMutes: [],
		hiddenPosts: [],
	},
	labelDefs: {},
};

const empty = (): DisplayRestrictions => ({
	noOverride: false,
	filters: [],
	blurs: [],
	alerts: [],
	informs: [],
});

const labeledPost = (vals: string[]) => {
	const author = mock.profileView({ handle: 'bob.test' });

	return moderatePost(
		mock.postView({
			record: mock.post({ text: 'hello' }),
			author,
			labels: vals.map((val) => {
				return mock.label({ val, uri: `at://${author.did}/app.bsky.feed.post/fake`, src: LABELER_DID });
			}),
		}),
		opts,
	);
};

describe('mergeDisplayRestrictions', () => {
	it('combines causes from multiple results and skips undefined', () => {
		const [cause] = getDisplayRestrictions(labeledPost(['porn']), DisplayContext.ContentMedia).blurs;

		const a: DisplayRestrictions = { ...empty(), blurs: [cause], filters: [cause] };
		const b: DisplayRestrictions = { ...empty(), alerts: [cause], informs: [cause] };

		const merged = mergeDisplayRestrictions(a, undefined, b);

		expect(merged.blurs).toHaveLength(1);
		expect(merged.filters).toHaveLength(1);
		expect(merged.alerts).toHaveLength(1);
		expect(merged.informs).toHaveLength(1);
		expect(merged.noOverride).toBe(false);
	});

	it('sets noOverride if any source requires it', () => {
		expect(mergeDisplayRestrictions(empty(), { ...empty(), noOverride: true }).noOverride).toBe(true);
		expect(mergeDisplayRestrictions().noOverride).toBe(false);
	});

	it('keeps merged causes ordered by priority', () => {
		const res = labeledPost(['porn', '!warn']);

		const media = getDisplayRestrictions(res, DisplayContext.ContentMedia);
		const view = getDisplayRestrictions(res, DisplayContext.ContentView);

		const merged = mergeDisplayRestrictions(media, view);
		const priorities = merged.blurs.map((cause) => cause.priority);

		expect(priorities).toHaveLength(2);
		expect(priorities).toEqual(priorities.toSorted((a, b) => a - b));
		expect(priorities).not.toEqual([...media.blurs, ...view.blurs].map((cause) => cause.priority));
	});
});
