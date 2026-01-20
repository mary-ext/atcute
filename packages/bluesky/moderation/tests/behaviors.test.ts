import { describe, expect, it } from 'vitest';

import {
	DisplayContext,
	getDisplayRestrictions,
	LabelPreference,
	moderatePost,
	moderateProfile,
} from '../lib/index.js';

import {
	ModerationBehaviorSuiteRunner,
	type ModerationTestSuiteScenario,
	type SuiteConfigurations,
	type SuiteScenarios,
	type SuiteUsers,
} from './util/moderation-behavior.js';

const USERS: SuiteUsers = {
	self: {
		blocking: false,
		blockingByList: false,
		blockedBy: false,
		muted: false,
		mutedByList: false,
	},
	alice: {
		blocking: false,
		blockingByList: false,
		blockedBy: false,
		muted: false,
		mutedByList: false,
	},
	bob: {
		blocking: true,
		blockingByList: false,
		blockedBy: false,
		muted: false,
		mutedByList: false,
	},
	carla: {
		blocking: false,
		blockingByList: false,
		blockedBy: true,
		muted: false,
		mutedByList: false,
	},
	dan: {
		blocking: false,
		blockingByList: false,
		blockedBy: false,
		muted: true,
		mutedByList: false,
	},
	elise: {
		blocking: false,
		blockingByList: false,
		blockedBy: false,
		muted: false,
		mutedByList: true,
	},
	fern: {
		blocking: true,
		blockingByList: false,
		blockedBy: true,
		muted: false,
		mutedByList: false,
	},
	georgia: {
		blocking: false,
		blockingByList: true,
		blockedBy: false,
		muted: false,
		mutedByList: false,
	},
};
const CONFIGURATIONS: SuiteConfigurations = {
	none: {},
	'adult-disabled': {
		adultContentEnabled: false,
	},
	'intolerant-hide': {
		settings: { intolerance: LabelPreference.Hide },
	},
	'intolerant-warn': {
		settings: { intolerance: LabelPreference.Warn },
	},
	'intolerant-ignore': {
		settings: { intolerance: LabelPreference.Ignore },
	},
	'porn-hide': {
		adultContentEnabled: true,
		settings: { porn: LabelPreference.Hide },
	},
	'porn-warn': {
		adultContentEnabled: true,
		settings: { porn: LabelPreference.Warn },
	},
	'porn-ignore': {
		adultContentEnabled: true,
		settings: { porn: LabelPreference.Ignore },
	},
	'scam-hide': {
		settings: { misrepresentation: LabelPreference.Hide },
	},
	'scam-warn': {
		settings: { misrepresentation: LabelPreference.Warn },
	},
	'scam-ignore': {
		settings: { misrepresentation: LabelPreference.Ignore },
	},
	'intolerant-hide-scam-warn': {
		settings: { intolerance: LabelPreference.Hide, misrepresentation: LabelPreference.Hide },
	},
	'logged-out': {
		authed: false,
	},
};
const SCENARIOS: SuiteScenarios = {
	"Imperative label ('!hide') on account": {
		cfg: 'none',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['!hide'] },
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['blur', 'noOverride'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Imperative label ('!hide') on profile": {
		cfg: 'none',
		subject: 'profile',
		author: 'alice',
		labels: { profile: ['!hide'] },
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
		},
	},
	"Imperative label ('!hide') on post": {
		cfg: 'none',
		subject: 'post',
		author: 'alice',
		labels: { post: ['!hide'] },
		behaviors: {
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Imperative label ('!hide') on author profile": {
		cfg: 'none',
		subject: 'post',
		author: 'alice',
		labels: { profile: ['!hide'] },
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
		},
	},
	"Imperative label ('!hide') on author account": {
		cfg: 'none',
		subject: 'post',
		author: 'alice',
		labels: { account: ['!hide'] },
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},

	"Imperative label ('!warn') on account": {
		cfg: 'none',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['!warn'] },
		behaviors: {
			profileList: ['blur'],
			profileView: ['blur'],
			profileMedia: ['blur'],
			contentList: ['blur'],
			contentView: ['blur'],
		},
	},
	"Imperative label ('!warn') on profile": {
		cfg: 'none',
		subject: 'profile',
		author: 'alice',
		labels: { profile: ['!warn'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},
	"Imperative label ('!warn') on post": {
		cfg: 'none',
		subject: 'post',
		author: 'alice',
		labels: { post: ['!warn'] },
		behaviors: {
			contentList: ['blur'],
			contentView: ['blur'],
		},
	},
	"Imperative label ('!warn') on author profile": {
		cfg: 'none',
		subject: 'post',
		author: 'alice',
		labels: { profile: ['!warn'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},
	"Imperative label ('!warn') on author account": {
		cfg: 'none',
		subject: 'post',
		author: 'alice',
		labels: { account: ['!warn'] },
		behaviors: {
			profileMedia: ['blur'],
			contentList: ['blur'],
			contentView: ['blur'],
		},
	},

	"Imperative label ('!no-unauthenticated') on account when logged out": {
		cfg: 'logged-out',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['!no-unauthenticated'] },
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['blur', 'noOverride'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Imperative label ('!no-unauthenticated') on profile when logged out": {
		cfg: 'logged-out',
		subject: 'profile',
		author: 'alice',
		labels: { profile: ['!no-unauthenticated'] },
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['blur', 'noOverride'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Imperative label ('!no-unauthenticated') on post when logged out": {
		cfg: 'logged-out',
		subject: 'post',
		author: 'alice',
		labels: { post: ['!no-unauthenticated'] },
		behaviors: {
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Imperative label ('!no-unauthenticated') on author profile when logged out": {
		cfg: 'logged-out',
		subject: 'post',
		author: 'alice',
		labels: { profile: ['!no-unauthenticated'] },
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Imperative label ('!no-unauthenticated') on author account when logged out": {
		cfg: 'logged-out',
		subject: 'post',
		author: 'alice',
		labels: { account: ['!no-unauthenticated'] },
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},

	"Imperative label ('!no-unauthenticated') on account when logged in": {
		cfg: 'none',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['!no-unauthenticated'] },
		behaviors: {},
	},
	"Imperative label ('!no-unauthenticated') on profile when logged in": {
		cfg: 'none',
		subject: 'profile',
		author: 'alice',
		labels: { profile: ['!no-unauthenticated'] },
		behaviors: {},
	},
	"Imperative label ('!no-unauthenticated') on post when logged in": {
		cfg: 'none',
		subject: 'post',
		author: 'alice',
		labels: { post: ['!no-unauthenticated'] },
		behaviors: {},
	},
	"Imperative label ('!no-unauthenticated') on author profile when logged in": {
		cfg: 'none',
		subject: 'post',
		author: 'alice',
		labels: { profile: ['!no-unauthenticated'] },
		behaviors: {},
	},
	"Imperative label ('!no-unauthenticated') on author account when logged in": {
		cfg: 'none',
		subject: 'post',
		author: 'alice',
		labels: { account: ['!no-unauthenticated'] },
		behaviors: {},
	},

	"Blur-media label ('porn') on account (hide)": {
		cfg: 'porn-hide',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['porn'] },
		behaviors: {
			profileList: ['filter'],
			profileMedia: ['blur'],
			contentList: ['filter'],
		},
	},
	"Blur-media label ('porn') on profile (hide)": {
		cfg: 'porn-hide',
		subject: 'profile',
		author: 'alice',
		labels: { profile: ['porn'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},
	"Blur-media label ('porn') on post (hide)": {
		cfg: 'porn-hide',
		subject: 'post',
		author: 'alice',
		labels: { post: ['porn'] },
		behaviors: {
			contentList: ['filter'],
			contentMedia: ['blur'],
		},
	},
	"Blur-media label ('porn') on author profile (hide)": {
		cfg: 'porn-hide',
		subject: 'post',
		author: 'alice',
		labels: { profile: ['porn'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},
	"Blur-media label ('porn') on author account (hide)": {
		cfg: 'porn-hide',
		subject: 'post',
		author: 'alice',
		labels: { account: ['porn'] },
		behaviors: {
			profileList: ['filter'],
			profileMedia: ['blur'],
			contentList: ['filter'],
		},
	},

	"Blur-media label ('porn') on account (warn)": {
		cfg: 'porn-warn',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['porn'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},
	"Blur-media label ('porn') on profile (warn)": {
		cfg: 'porn-warn',
		subject: 'profile',
		author: 'alice',
		labels: { profile: ['porn'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},
	"Blur-media label ('porn') on post (warn)": {
		cfg: 'porn-warn',
		subject: 'post',
		author: 'alice',
		labels: { post: ['porn'] },
		behaviors: {
			contentMedia: ['blur'],
		},
	},
	"Blur-media label ('porn') on author profile (warn)": {
		cfg: 'porn-warn',
		subject: 'post',
		author: 'alice',
		labels: { profile: ['porn'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},
	"Blur-media label ('porn') on author account (warn)": {
		cfg: 'porn-warn',
		subject: 'post',
		author: 'alice',
		labels: { account: ['porn'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},

	"Blur-media label ('porn') on account (ignore)": {
		cfg: 'porn-ignore',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['porn'] },
		behaviors: {},
	},
	"Blur-media label ('porn') on profile (ignore)": {
		cfg: 'porn-ignore',
		subject: 'profile',
		author: 'alice',
		labels: { profile: ['porn'] },
		behaviors: {},
	},
	"Blur-media label ('porn') on post (ignore)": {
		cfg: 'porn-ignore',
		subject: 'post',
		author: 'alice',
		labels: { post: ['porn'] },
		behaviors: {},
	},
	"Blur-media label ('porn') on author profile (ignore)": {
		cfg: 'porn-ignore',
		subject: 'post',
		author: 'alice',
		labels: { profile: ['porn'] },
		behaviors: {},
	},
	"Blur-media label ('porn') on author account (ignore)": {
		cfg: 'porn-ignore',
		subject: 'post',
		author: 'alice',
		labels: { account: ['porn'] },
		behaviors: {},
	},

	'Adult-only label on account when adult content is disabled': {
		cfg: 'adult-disabled',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['porn'] },
		behaviors: {
			profileList: ['filter'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter'],
		},
	},
	'Adult-only label on profile when adult content is disabled': {
		cfg: 'adult-disabled',
		subject: 'profile',
		author: 'alice',
		labels: { profile: ['porn'] },
		behaviors: {
			profileList: [],
			profileMedia: ['blur', 'noOverride'],
			contentList: [],
		},
	},
	'Adult-only label on post when adult content is disabled': {
		cfg: 'adult-disabled',
		subject: 'post',
		author: 'alice',
		labels: { post: ['porn'] },
		behaviors: {
			contentList: ['filter'],
			contentMedia: ['blur', 'noOverride'],
		},
	},
	'Adult-only label on author profile when adult content is disabled': {
		cfg: 'adult-disabled',
		subject: 'post',
		author: 'alice',
		labels: { profile: ['porn'] },
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
			contentList: [],
		},
	},
	'Adult-only label on author account when adult content is disabled': {
		cfg: 'adult-disabled',
		subject: 'post',
		author: 'alice',
		labels: { account: ['porn'] },
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter'],
		},
	},

	'Self-profile: !hide on account': {
		cfg: 'none',
		subject: 'profile',
		author: 'self',
		labels: { account: ['!hide'] },
		behaviors: {
			profileMedia: ['blur'],
			profileList: ['blur'],
			profileView: ['blur'],
			contentList: ['blur'],
			contentView: ['blur'],
		},
	},
	'Self-profile: !hide on profile': {
		cfg: 'none',
		subject: 'profile',
		author: 'self',
		labels: { profile: ['!hide'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},

	"Self-post: Imperative label ('!hide') on post": {
		cfg: 'none',
		subject: 'post',
		author: 'self',
		labels: { post: ['!hide'] },
		behaviors: {
			contentView: ['blur'],
			contentList: ['blur'],
		},
	},
	"Self-post: Imperative label ('!hide') on author profile": {
		cfg: 'none',
		subject: 'post',
		author: 'self',
		labels: { profile: ['!hide'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},
	"Self-post: Imperative label ('!hide') on author account": {
		cfg: 'none',
		subject: 'post',
		author: 'self',
		labels: { account: ['!hide'] },
		behaviors: {
			profileMedia: ['blur'],
			contentList: ['blur'],
			contentView: ['blur'],
		},
	},

	"Self-post: Imperative label ('!warn') on post": {
		cfg: 'none',
		subject: 'post',
		author: 'self',
		labels: { post: ['!warn'] },
		behaviors: {
			contentView: ['blur'],
			contentList: ['blur'],
		},
	},
	"Self-post: Imperative label ('!warn') on author profile": {
		cfg: 'none',
		subject: 'post',
		author: 'self',
		labels: { profile: ['!warn'] },
		behaviors: {
			profileMedia: ['blur'],
		},
	},
	"Self-post: Imperative label ('!warn') on author account": {
		cfg: 'none',
		subject: 'post',
		author: 'self',
		labels: { account: ['!warn'] },
		behaviors: {
			profileMedia: ['blur'],
			contentList: ['blur'],
			contentView: ['blur'],
		},
	},

	'Mute/block: Blocking user': {
		cfg: 'none',
		subject: 'profile',
		author: 'bob',
		labels: {},
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['alert'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	'Post with blocked author': {
		cfg: 'none',
		subject: 'post',
		author: 'bob',
		labels: {},
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	'Post with author blocking user': {
		cfg: 'none',
		subject: 'post',
		author: 'carla',
		labels: {},
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},

	'Mute/block: Blocking-by-list user': {
		cfg: 'none',
		subject: 'profile',
		author: 'georgia',
		labels: {},
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['alert'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},

	'Mute/block: Blocked by user': {
		cfg: 'none',
		subject: 'profile',
		author: 'carla',
		labels: {},
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['alert'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},

	'Mute/block: Muted user': {
		cfg: 'none',
		subject: 'profile',
		author: 'dan',
		labels: {},
		behaviors: {
			profileList: ['filter', 'inform'],
			profileView: ['alert'],
			contentList: ['filter', 'blur'],
			contentView: ['inform'],
		},
	},

	'Mute/block: Muted-by-list user': {
		cfg: 'none',
		subject: 'profile',
		author: 'elise',
		labels: {},
		behaviors: {
			profileList: ['filter', 'inform'],
			profileView: ['alert'],
			contentList: ['filter', 'blur'],
			contentView: ['inform'],
		},
	},

	'Merging: blocking & blocked-by user': {
		cfg: 'none',
		subject: 'profile',
		author: 'fern',
		labels: {},
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['alert'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},

	'Post with muted author': {
		cfg: 'none',
		subject: 'post',
		author: 'dan',
		labels: {},
		behaviors: {
			contentList: ['filter', 'blur'],
			contentView: ['inform'],
		},
	},

	'Post with muted-by-list author': {
		cfg: 'none',
		subject: 'post',
		author: 'elise',
		labels: {},
		behaviors: {
			contentList: ['filter', 'blur'],
			contentView: ['inform'],
		},
	},

	"Merging: '!hide' label on account of blocked user": {
		cfg: 'none',
		subject: 'profile',
		author: 'bob',
		labels: { account: ['!hide'] },
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['blur', 'alert', 'noOverride'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Merging: '!hide' and 'porn' labels on account (hide)": {
		cfg: 'porn-hide',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['!hide', 'porn'] },
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['blur', 'noOverride'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Merging: '!warn' and 'porn' labels on account (hide)": {
		cfg: 'porn-hide',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['!warn', 'porn'] },
		behaviors: {
			profileList: ['filter', 'blur'],
			profileView: ['blur'],
			profileMedia: ['blur'],
			contentList: ['filter', 'blur'],
			contentView: ['blur'],
		},
	},
	'Merging: !hide on account, !warn on profile': {
		cfg: 'none',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['!hide'], profile: ['!warn'] },
		behaviors: {
			profileList: ['filter', 'blur', 'noOverride'],
			profileView: ['blur', 'noOverride'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	'Merging: !warn on account, !hide on profile': {
		cfg: 'none',
		subject: 'profile',
		author: 'alice',
		labels: { account: ['!warn'], profile: ['!hide'] },
		behaviors: {
			profileList: ['blur'],
			profileView: ['blur'],
			profileMedia: ['blur', 'noOverride'],
			contentList: ['blur'],
			contentView: ['blur'],
		},
	},
	'Merging: post with blocking & blocked-by author': {
		cfg: 'none',
		subject: 'post',
		author: 'fern',
		labels: {},
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Merging: '!hide' label on post by blocked user": {
		cfg: 'none',
		subject: 'post',
		author: 'bob',
		labels: { post: ['!hide'] },
		behaviors: {
			profileMedia: ['blur', 'noOverride'],
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
		},
	},
	"Merging: '!hide' and 'porn' labels on post (hide)": {
		cfg: 'porn-hide',
		subject: 'post',
		author: 'alice',
		labels: { post: ['!hide', 'porn'] },
		behaviors: {
			contentList: ['filter', 'blur', 'noOverride'],
			contentView: ['blur', 'noOverride'],
			contentMedia: ['blur'],
		},
	},
	"Merging: '!warn' and 'porn' labels on post (hide)": {
		cfg: 'porn-hide',
		subject: 'post',
		author: 'alice',
		labels: { post: ['!warn', 'porn'] },
		behaviors: {
			contentList: ['filter', 'blur'],
			contentView: ['blur'],
			contentMedia: ['blur'],
		},
	},
};

const suite = new ModerationBehaviorSuiteRunner(USERS, CONFIGURATIONS, SCENARIOS);

describe('Post moderation behaviors', () => {
	const scenarios = Array.from(Object.entries(suite.scenarios)).filter(([name]) => !name.startsWith('//'));
	it.each(scenarios)('%s', (_name: string, scenario: ModerationTestSuiteScenario) => {
		const res =
			scenario.subject === 'profile'
				? moderateProfile(suite.profileScenario(scenario), suite.moderationOptions(scenario))
				: moderatePost(suite.postScenario(scenario), suite.moderationOptions(scenario));
		if (scenario.subject === 'profile') {
			expect(getDisplayRestrictions(res, DisplayContext.ProfileList)).toBeModerationResult(
				scenario.behaviors.profileList,
				'profileList',
				JSON.stringify(res, null, 2),
			);
			expect(getDisplayRestrictions(res, DisplayContext.ProfileView)).toBeModerationResult(
				scenario.behaviors.profileView,
				'profileView',
				JSON.stringify(res, null, 2),
			);
		}
		expect(getDisplayRestrictions(res, DisplayContext.ProfileMedia)).toBeModerationResult(
			scenario.behaviors.profileMedia,
			'avatar',
			JSON.stringify(res, null, 2),
		);
		expect(getDisplayRestrictions(res, DisplayContext.ContentList)).toBeModerationResult(
			scenario.behaviors.contentList,
			'contentList',
			JSON.stringify(res, null, 2),
		);
		expect(getDisplayRestrictions(res, DisplayContext.ContentView)).toBeModerationResult(
			scenario.behaviors.contentView,
			'contentView',
			JSON.stringify(res, null, 2),
		);
		expect(getDisplayRestrictions(res, DisplayContext.ContentMedia)).toBeModerationResult(
			scenario.behaviors.contentMedia,
			'contentMedia',
			JSON.stringify(res, null, 2),
		);
	});
});
