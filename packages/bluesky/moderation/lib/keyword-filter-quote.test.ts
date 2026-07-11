import type { ResourceUri } from '@atcute/lexicons';

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

const FAKE_FOLLOW = 'at://did:web:alice.test/app.bsky.graph.follow/fake' as ResourceUri;

const opts = (): ModerationOptions => ({
	viewerDid: 'did:web:alice.test',
	prefs: {
		adultContentEnabled: true,
		globalLabelPrefs: {},
		prefsByLabelers: {},
		keywordFilters: [
			interpretMutedWordPreference({
				value: 'spoiler',
				targets: ['content'],
				actorTarget: 'exclude-following',
			}),
		],
		temporaryMutes: [],
		hiddenPosts: [],
	},
	labelDefs: {},
});

// follow states are set in opposition so consulting the wrong author flips the result
const quotePost = ({ quotedFollowed }: { quotedFollowed: boolean }) => {
	const followed = () => mock.actorViewerState({ following: FAKE_FOLLOW });

	return mock.postView({
		record: mock.post({ text: 'check this out' }),
		author: mock.profileView({
			handle: 'bob.test',
			viewer: quotedFollowed ? undefined : followed(),
		}),
		embed: mock.embedRecordView({
			record: mock.post({ text: 'nothing to see here' }),
			author: mock.profileView({
				handle: 'carla.test',
				viewer: quotedFollowed ? followed() : undefined,
			}),
			embeds: [mock.externalEmbedView({ title: 'spoiler alert' })],
		}),
	});
};

describe('Moderation: keyword filters on quoted embeds', () => {
	it('filters when the quoted author is not followed', () => {
		const res = moderatePost(quotePost({ quotedFollowed: false }), opts());

		expect(getDisplayRestrictions(res, DisplayContext.ContentList)).toBeModerationResult(['blur', 'filter']);
	});

	it('does not filter when the quoted author is followed', () => {
		const res = moderatePost(quotePost({ quotedFollowed: true }), opts());

		expect(getDisplayRestrictions(res, DisplayContext.ContentList)).toBeModerationResult([]);
	});
});
