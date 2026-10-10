import { describe, expect, it } from 'vitest';

import * as mock from './_test-util/mock.ts';
import './_test-util/moderation-behavior.ts';
import {
	DisplayContext,
	type ModerationOptions,
	getDisplayRestrictions,
	interpretMutedWordPreference,
	moderatePost,
} from './index.ts';

const opts: ModerationOptions = {
	viewerDid: 'did:web:alice.test',
	prefs: {
		adultContentEnabled: true,
		globalLabelPrefs: {},
		prefsByLabelers: {},
		keywordFilters: [
			interpretMutedWordPreference({
				value: 'spoiler',
				targets: ['content'],
				actorTarget: 'all',
			}),
		],
		temporaryMutes: [],
		hiddenPosts: [],
	},
	labelDefs: {},
};

describe('Moderation: keyword filters on gallery embeds', () => {
	it('matches gallery image alt text', () => {
		const res = moderatePost(
			mock.postView({
				record: mock.post({ text: 'check this out' }),
				author: mock.profileView({ handle: 'bob.test' }),
				embed: mock.galleryEmbedView({ alts: ['a cat', 'spoiler alert'] }),
			}),
			opts,
		);

		expect(getDisplayRestrictions(res, DisplayContext.ContentList)).toBeModerationResult(['blur', 'filter']);
	});

	it('does not match unrelated gallery image alt text', () => {
		const res = moderatePost(
			mock.postView({
				record: mock.post({ text: 'check this out' }),
				author: mock.profileView({ handle: 'bob.test' }),
				embed: mock.galleryEmbedView({ alts: ['a cat', ''] }),
			}),
			opts,
		);

		expect(getDisplayRestrictions(res, DisplayContext.ContentList)).toBeModerationResult([]);
	});

	it('matches gallery image alt text in a quoted post', () => {
		const res = moderatePost(
			mock.postView({
				record: mock.post({ text: 'check this out' }),
				author: mock.profileView({ handle: 'bob.test' }),
				embed: mock.embedRecordView({
					record: mock.post({ text: 'nothing to see here' }),
					author: mock.profileView({ handle: 'carla.test' }),
					embeds: [mock.galleryEmbedView({ alts: ['spoiler alert'] })],
				}),
			}),
			opts,
		);

		expect(getDisplayRestrictions(res, DisplayContext.ContentList)).toBeModerationResult(['blur', 'filter']);
	});
});
