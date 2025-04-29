import { describe, expect, it } from 'vitest';

import type { ComAtprotoLabelDefs } from '@atcute/client/lexicons';

import {
	DisplayContext,
	getDisplayRestrictions,
	interpretLabelValueDefinition,
	LabelPreference,
	moderatePost,
	type InterpretedLabelDefinition,
	type ModerationOptions,
} from '../lib/index.js';

import * as mock from './util/mock.js';
import { type ModerationTestSuiteResultFlag } from './util/moderation-behavior.js';

interface ScenarioResult {
	profileList?: ModerationTestSuiteResultFlag[];
	profileView?: ModerationTestSuiteResultFlag[];
	profileMedia?: ModerationTestSuiteResultFlag[];
	contentList?: ModerationTestSuiteResultFlag[];
	contentView?: ModerationTestSuiteResultFlag[];
	contentMedia?: ModerationTestSuiteResultFlag[];
}

interface Scenario {
	blurs: 'content' | 'media' | 'none';
	severity: 'alert' | 'inform' | 'none';
	account: ScenarioResult;
	profile: ScenarioResult;
	post: ScenarioResult;
}

const TESTS: Scenario[] = [
	{
		blurs: 'content',
		severity: 'alert',
		account: {
			profileList: ['filter'],
			contentList: ['filter'],
		},
		profile: {},
		post: {
			contentList: ['filter'],
		},
	},
	{
		blurs: 'content',
		severity: 'inform',
		account: {
			profileList: ['filter'],
			contentList: ['filter'],
		},
		profile: {},
		post: {
			contentList: ['filter'],
		},
	},
	{
		blurs: 'content',
		severity: 'none',
		account: {
			profileList: ['filter'],
			contentList: ['filter'],
		},
		profile: {},
		post: {
			contentList: ['filter'],
		},
	},

	{
		blurs: 'media',
		severity: 'alert',
		account: {
			profileList: ['filter'],
			contentList: ['filter'],
		},
		profile: {},
		post: {
			contentList: ['filter'],
		},
	},
	{
		blurs: 'media',
		severity: 'inform',
		account: {
			profileList: ['filter'],
			contentList: ['filter'],
		},
		profile: {},
		post: {
			contentList: ['filter'],
		},
	},
	{
		blurs: 'media',
		severity: 'none',
		account: {
			profileList: ['filter'],
			contentList: ['filter'],
		},
		profile: {},
		post: {
			contentList: ['filter'],
		},
	},

	{
		blurs: 'none',
		severity: 'alert',
		account: {
			profileList: ['filter'],
			contentList: ['filter'],
		},
		profile: {},
		post: {
			contentList: ['filter'],
		},
	},
	{
		blurs: 'none',
		severity: 'inform',
		account: {
			profileList: ['filter'],
			contentList: ['filter'],
		},
		profile: {},
		post: {
			contentList: ['filter'],
		},
	},
	{
		blurs: 'none',
		severity: 'none',
		account: {
			profileList: ['filter'],
			contentList: ['filter'],
		},
		profile: {},
		post: {
			contentList: ['filter'],
		},
	},
];

describe('Moderation: quote posts', () => {
	const scenarios = TESTS.flatMap((test) => [
		{
			blurs: test.blurs,
			severity: test.severity,
			target: 'post',
			expected: test.post,
		},
		{
			blurs: test.blurs,
			severity: test.severity,
			target: 'profile',
			expected: test.profile,
		},
		{
			blurs: test.blurs,
			severity: test.severity,
			target: 'account',
			expected: test.account,
		},
	]);
	it.each(scenarios)(
		'blurs=$blurs, severity=$severity, target=$target',
		({ blurs, severity, target, expected }) => {
			let postLabels;
			let profileLabels;
			if (target === 'post') {
				postLabels = [
					mock.label({
						val: 'custom',
						uri: 'at://did:web:carla.test/app.bsky.feed.post/fake',
						src: 'did:web:labeler.test',
					}),
				];
			} else if (target === 'profile') {
				profileLabels = [
					mock.label({
						val: 'custom',
						uri: 'at://did:web:carla.test/app.bsky.actor.profile/self',
						src: 'did:web:labeler.test',
					}),
				];
			} else {
				profileLabels = [
					mock.label({
						val: 'custom',
						uri: 'did:web:carla.test',
						src: 'did:web:labeler.test',
					}),
				];
			}

			const post = mock.postView({
				record: {
					$type: 'app.bsky.feed.post',
					text: 'Hello',
					createdAt: new Date().toISOString(),
				},
				embed: mock.embedRecordView({
					record: mock.post({
						text: 'Quoted post text',
					}),
					labels: postLabels,
					author: mock.profileView({
						handle: 'carla.test',
						displayName: 'Carla',
						labels: profileLabels,
					}),
				}),
				author: mock.profileView({
					handle: 'bob.test',
					displayName: 'Bob',
				}),
			});

			const res = moderatePost(post, modOpts(blurs, severity));

			expect(getDisplayRestrictions(res, DisplayContext.ProfileList)).toBeModerationResult(
				expected.profileList || [],
			);
			expect(getDisplayRestrictions(res, DisplayContext.ProfileView)).toBeModerationResult(
				expected.profileView || [],
			);
			expect(getDisplayRestrictions(res, DisplayContext.ProfileMedia)).toBeModerationResult(
				expected.profileMedia || [],
			);
			expect(getDisplayRestrictions(res, DisplayContext.ContentList)).toBeModerationResult(
				expected.contentList || [],
			);
			expect(getDisplayRestrictions(res, DisplayContext.ContentView)).toBeModerationResult(
				expected.contentView || [],
			);
			expect(getDisplayRestrictions(res, DisplayContext.ContentMedia)).toBeModerationResult(
				expected.contentMedia || [],
			);
		},
	);
});

function modOpts(
	blurs: ComAtprotoLabelDefs.LabelValueDefinition['blurs'],
	severity: ComAtprotoLabelDefs.LabelValueDefinition['severity'],
): ModerationOptions {
	return {
		viewerDid: 'did:web:alice.test',
		prefs: {
			adultContentEnabled: true,
			globalLabelPrefs: {},
			prefsByLabelers: {
				'did:web:labeler.test': {
					labelPrefs: {
						custom: LabelPreference.Hide,
					},
				},
			},
			keywordFilters: [],
			temporaryMutes: [],
			hiddenPosts: [],
		},
		labelDefs: {
			'did:web:labeler.test': {
				custom: makeCustomLabel(blurs, severity),
			},
		},
	};
}

function makeCustomLabel(
	blurs: ComAtprotoLabelDefs.LabelValueDefinition['blurs'],
	severity: ComAtprotoLabelDefs.LabelValueDefinition['severity'],
): InterpretedLabelDefinition {
	return interpretLabelValueDefinition({
		identifier: 'custom',
		blurs,
		severity,
		defaultSetting: 'warn',
		locales: [],
	});
}
