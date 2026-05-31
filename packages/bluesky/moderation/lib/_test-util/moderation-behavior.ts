import type { ComAtprotoLabelDefs } from '@atcute/atproto';

import { expect } from 'vitest';

import { type DisplayRestrictions, type LabelPreference, type ModerationOptions } from '../index.ts';

import * as m from './mock.ts';

export type ModerationTestSuiteResultFlag = 'filter' | 'blur' | 'alert' | 'inform' | 'noOverride';

export interface ModerationTestSuiteScenario {
	cfg: string;
	subject: 'post' | 'profile' | 'userlist' | 'feedgen';
	author: string;
	quoteAuthor?: string;
	labels: {
		post?: string[];
		profile?: string[];
		account?: string[];
		quotedPost?: string[];
		quotedAccount?: string[];
	};
	behaviors: {
		profileList?: ModerationTestSuiteResultFlag[];
		profileView?: ModerationTestSuiteResultFlag[];
		profileMedia?: ModerationTestSuiteResultFlag[];
		profileBio?: ModerationTestSuiteResultFlag[];
		contentList?: ModerationTestSuiteResultFlag[];
		contentView?: ModerationTestSuiteResultFlag[];
		contentMedia?: ModerationTestSuiteResultFlag[];
	};
}

export type SuiteUsers = Record<
	string,
	{
		blocking: boolean;
		blockingByList: boolean;
		blockedBy: boolean;
		muted: boolean;
		mutedByList: boolean;
	}
>;

export type SuiteConfigurations = Record<
	string,
	{
		authed?: boolean;
		adultContentEnabled?: boolean;
		settings?: Record<string, LabelPreference>;
	}
>;

export type SuiteScenarios = Record<string, ModerationTestSuiteScenario>;

expect.extend({
	toBeModerationResult(
		actual: DisplayRestrictions,
		expected: ModerationTestSuiteResultFlag[] | undefined,
		context = '',
		stringifiedResult: string | undefined = undefined,
		_ignoreCause = false,
	) {
		const fail = (msg: string) => ({
			pass: false,
			message: () => `${msg}.${stringifiedResult ? ` Full result: ${stringifiedResult}` : ''}`,
		});
		// let cause = actual.causes?.type as string
		// if (actual.cause?.type === 'label') {
		//   cause = `label:${actual.cause.labelDef.id}`
		// } else if (actual.cause?.type === 'muted') {
		//   if (actual.cause.source.type === 'list') {
		//     cause = 'muted-by-list'
		//   }
		// } else if (actual.cause?.type === 'blocking') {
		//   if (actual.cause.source.type === 'list') {
		//     cause = 'blocking-by-list'
		//   }
		// }
		if (!expected) {
			// if (!ignoreCause && actual.cause) {
			//   return fail(`${context} expected to be a no-op, got ${cause}`)
			// }
			if (actual.informs.length > 0) {
				return fail(`${context} expected to be a no-op, got inform=true`);
			}
			if (actual.alerts.length > 0) {
				return fail(`${context} expected to be a no-op, got alert=true`);
			}
			if (actual.blurs.length > 0) {
				return fail(`${context} expected to be a no-op, got blur=true`);
			}
			if (actual.filters.length > 0) {
				return fail(`${context} expected to be a no-op, got filter=true`);
			}
			if (actual.noOverride) {
				return fail(`${context} expected to be a no-op, got noOverride=true`);
			}
		} else {
			// if (!ignoreCause && cause !== expected.cause) {
			//   return fail(`${context} expected to be ${expected.cause}, got ${cause}`)
			// }
			const expectedInform = expected.includes('inform');
			if (!!(actual.informs.length > 0) !== expectedInform) {
				return fail(
					`${context} expected to be inform=${expectedInform}, got ${actual.informs.length > 0 || false}`,
				);
			}
			const expectedAlert = expected.includes('alert');
			if (!!(actual.alerts.length > 0) !== expectedAlert) {
				return fail(
					`${context} expected to be alert=${expectedAlert}, got ${actual.alerts.length > 0 || false}`,
				);
			}
			const expectedBlur = expected.includes('blur');
			if (!!(actual.blurs.length > 0) !== expectedBlur) {
				return fail(
					`${context} expected to be blur=${expectedBlur}, got ${actual.blurs.length > 0 || false}`,
				);
			}
			const expectedFilter = expected.includes('filter');
			if (!!(actual.filters.length > 0) !== expectedFilter) {
				return fail(
					`${context} expected to be filter=${expectedFilter}, got ${actual.filters.length > 0 || false}`,
				);
			}
			const expectedNoOverride = expected.includes('noOverride');
			if (!!actual.noOverride !== expectedNoOverride) {
				return fail(
					`${context} expected to be noOverride=${expectedNoOverride}, got ${actual.noOverride || false}`,
				);
			}
		}
		return { pass: true, message: () => '' };
	},
});

declare module 'vitest' {
	// oxlint-disable-next-line no-unused-vars -- required for module augmentation
	// oxlint-disable-next-line typescript/no-explicit-any
	interface Assertion<T = any> {
		toBeModerationResult(
			expected?: ModerationTestSuiteResultFlag[],
			context?: string,
			stringifiedResult?: string,
			ignoreCause?: boolean,
		): void;
	}

	interface AsymmetricMatchers {
		toBeModerationResult(
			expected?: ModerationTestSuiteResultFlag[],
			context?: string,
			stringifiedResult?: string,
			ignoreCause?: boolean,
			// oxlint-disable-next-line typescript/no-explicit-any
		): any;
	}
}

export class ModerationBehaviorSuiteRunner {
	users: SuiteUsers;
	configurations: SuiteConfigurations;
	scenarios: SuiteScenarios;

	constructor(users: SuiteUsers, configurations: SuiteConfigurations, scenarios: SuiteScenarios) {
		this.users = users;
		this.configurations = configurations;
		this.scenarios = scenarios;
	}

	postScenario(scenario: ModerationTestSuiteScenario) {
		if (scenario.subject !== 'post') {
			throw new Error('Scenario subject must be "post"');
		}
		const author = this.profileView(scenario.author, scenario.labels);
		return m.postView({
			record: m.post({
				text: 'Post text',
			}),
			author,
			labels: (scenario.labels.post || []).map((val) =>
				m.label({ val, uri: `at://${author.did}/app.bsky.feed.post/fake` }),
			),
			embed: scenario.quoteAuthor
				? m.embedRecordView({
						record: m.post({
							text: 'Quoted post text',
						}),
						labels: (scenario.labels.quotedPost || []).map((val) =>
							m.label({
								val,
								uri: `at://${author.did}/app.bsky.feed.post/fake`,
							}),
						),
						author: this.profileView(scenario.quoteAuthor, {
							account: scenario.labels.quotedAccount,
						}),
					})
				: undefined,
		});
	}

	profileScenario(scenario: ModerationTestSuiteScenario) {
		if (scenario.subject !== 'profile') {
			throw new Error('Scenario subject must be "profile"');
		}
		return this.profileView(scenario.author, scenario.labels);
	}

	profileView(name: string, scenarioLabels: ModerationTestSuiteScenario['labels']) {
		const def = this.users[name];

		const labels: ComAtprotoLabelDefs.Label[] = [];
		if (scenarioLabels.account) {
			for (const l of scenarioLabels.account) {
				labels.push(m.label({ val: l, uri: `did:web:${name}` }));
			}
		}
		if (scenarioLabels.profile) {
			for (const l of scenarioLabels.profile) {
				labels.push(
					m.label({
						val: l,
						uri: `at://did:web:${name}/app.bsky.actor.profile/self`,
					}),
				);
			}
		}

		return m.profileView({
			handle: `${name}.test`,
			labels,
			viewer: m.actorViewerState({
				muted: def.muted || def.mutedByList,
				mutedByList: def.mutedByList ? m.listViewBasic({ name: 'Fake List' }) : undefined,
				blockedBy: def.blockedBy,
				blocking:
					def.blocking || def.blockingByList ? 'at://did:web:self.test/app.bsky.graph.block/fake' : undefined,
				blockingByList: def.blockingByList ? m.listViewBasic({ name: 'Fake List' }) : undefined,
			}),
		});
	}

	moderationOptions(scenario: ModerationTestSuiteScenario): ModerationOptions {
		return {
			viewerDid: this.configurations[scenario.cfg].authed === false ? undefined : 'did:web:self.test',
			prefs: {
				adultContentEnabled: Boolean(this.configurations[scenario.cfg]?.adultContentEnabled),
				globalLabelPrefs: this.configurations[scenario.cfg].settings || {},
				prefsByLabelers: {
					'did:plc:fake-labeler': {
						labelPrefs: {},
					},
				},
				hiddenPosts: [],
				keywordFilters: [],
				temporaryMutes: [],
			},
		};
	}
}
