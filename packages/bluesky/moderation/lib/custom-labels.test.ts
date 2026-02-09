import type { ComAtprotoLabelDefs } from '@atcute/atproto';

import { describe, expect, it } from 'vitest';

import * as mock from './_test-util/mock.ts';
import { type ModerationTestSuiteResultFlag } from './_test-util/moderation-behavior.ts';
import {
	DisplayContext,
	type InterpretedLabelDefinition,
	LabelPreference,
	type ModerationOptions,
	getDisplayRestrictions,
	interpretLabelValueDefinition,
	moderatePost,
	moderateProfile,
} from './index.ts';

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
			profileList: ['filter', 'alert'],
			profileView: ['alert'],
			contentList: ['filter', 'blur'],
			contentView: ['alert'],
		},
		profile: {
			profileList: ['alert'],
			profileView: ['alert'],
		},
		post: {
			contentList: ['filter', 'blur'],
			contentView: ['alert'],
		},
	},
	{
		blurs: 'content',
		severity: 'inform',
		account: {
			profileList: ['filter', 'inform'],
			profileView: ['inform'],
			contentList: ['filter', 'blur'],
			contentView: ['inform'],
		},
		profile: {
			profileList: ['inform'],
			profileView: ['inform'],
		},
		post: {
			contentList: ['filter', 'blur'],
			contentView: ['inform'],
		},
	},
	{
		blurs: 'content',
		severity: 'none',
		account: {
			profileList: ['filter'],
			profileView: [],
			contentList: ['filter', 'blur'],
			contentView: [],
		},
		profile: {
			profileList: [],
			profileView: [],
		},
		post: {
			contentList: ['filter', 'blur'],
			contentView: [],
		},
	},

	{
		blurs: 'media',
		severity: 'alert',
		account: {
			profileList: ['filter', 'alert'],
			profileView: ['alert'],
			profileMedia: ['blur'],
			contentList: ['filter'],
		},
		profile: {
			profileList: ['alert'],
			profileView: ['alert'],
			profileMedia: ['blur'],
		},
		post: {
			contentList: ['filter'],
			contentMedia: ['blur'],
		},
	},
	{
		blurs: 'media',
		severity: 'inform',
		account: {
			profileList: ['filter', 'inform'],
			profileView: ['inform'],
			profileMedia: ['blur'],
			contentList: ['filter'],
		},
		profile: {
			profileList: ['inform'],
			profileView: ['inform'],
			profileMedia: ['blur'],
		},
		post: {
			contentList: ['filter'],
			contentMedia: ['blur'],
		},
	},
	{
		blurs: 'media',
		severity: 'none',
		account: {
			profileList: ['filter'],
			profileMedia: ['blur'],
			contentList: ['filter'],
		},
		profile: {
			profileMedia: ['blur'],
		},
		post: {
			contentList: ['filter'],
			contentMedia: ['blur'],
		},
	},

	{
		blurs: 'none',
		severity: 'alert',
		account: {
			profileList: ['filter', 'alert'],
			profileView: ['alert'],
			contentList: ['filter', 'alert'],
			contentView: ['alert'],
		},
		profile: {
			profileList: ['alert'],
			profileView: ['alert'],
		},
		post: {
			contentList: ['filter', 'alert'],
			contentView: ['alert'],
		},
	},
	{
		blurs: 'none',
		severity: 'inform',
		account: {
			profileList: ['filter', 'inform'],
			profileView: ['inform'],
			contentList: ['filter', 'inform'],
			contentView: ['inform'],
		},
		profile: {
			profileList: ['inform'],
			profileView: ['inform'],
		},
		post: {
			contentList: ['filter', 'inform'],
			contentView: ['inform'],
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

describe('Moderation: custom labels', () => {
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
			let res;
			if (target === 'post') {
				res = moderatePost(
					mock.postView({
						record: {
							$type: 'app.bsky.feed.post',
							text: 'Hello',
							createdAt: new Date().toISOString(),
						},
						author: mock.profileView({
							handle: 'bob.test',
							displayName: 'Bob',
						}),
						labels: [
							mock.label({
								val: 'custom',
								uri: 'at://did:web:bob.test/app.bsky.feed.post/fake',
								src: 'did:web:labeler.test',
							}),
						],
					}),
					modOpts(blurs, severity),
				);
			} else if (target === 'profile') {
				res = moderateProfile(
					mock.profileView({
						handle: 'bob.test',
						displayName: 'Bob',
						labels: [
							mock.label({
								val: 'custom',
								uri: 'at://did:web:bob.test/app.bsky.actor.profile/self',
								src: 'did:web:labeler.test',
							}),
						],
					}),
					modOpts(blurs, severity),
				);
			} else {
				res = moderateProfile(
					mock.profileView({
						handle: 'bob.test',
						displayName: 'Bob',
						labels: [
							mock.label({
								val: 'custom',
								uri: 'did:web:bob.test',
								src: 'did:web:labeler.test',
							}),
						],
					}),
					modOpts(blurs, severity),
				);
			}
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
