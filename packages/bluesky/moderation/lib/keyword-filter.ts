import type { AppBskyActorDefs } from '@atcute/bluesky';

const WORD_CHAR_RE = /^\w$/;
const WHITESPACE_RE = /\s+/;

export interface KeywordMatch {
	/** keyword value */
	value: string;
	/** match whole keyword */
	whole: boolean;
}

export const createKeywordPattern = (matchers: KeywordMatch | KeywordMatch[]): RegExp => {
	if (!Array.isArray(matchers)) {
		matchers = [matchers];
	}

	let re = '';

	for (let idx = 0, len = matchers.length; idx < len; idx++) {
		const match = matchers[idx];

		const whole = match.whole;
		let value = match.value;

		value = value.trim();
		if (value.length === 0) {
			continue;
		}

		if (re) {
			re += '|';
		}

		if (whole && WORD_CHAR_RE.test(value.at(0)!)) {
			re += '\\b';
		}

		re += escape(value).replace(WHITESPACE_RE, '\\s+');

		if (whole && WORD_CHAR_RE.test(value.at(-1)!)) {
			re += '\\b';
		}
	}

	// an empty source compiles to a pattern that matches every string; never match instead
	return new RegExp(re || '(?!)', 'i');
};

const ESCAPE_RE = /[.*+?^${}()|[\]\\]/g;
const escape = (str: string) => {
	return str.replace(ESCAPE_RE, '\\$&');
};

export const KeywordFilterFlags = {
	/** filter applies to content */
	ApplyContent: 1 << 0,
	/** filter applies to tags */
	ApplyTopic: 1 << 1,
	/** filter shouldn't apply to following users */
	NoFollowing: 1 << 2,
} as const;
export type KeywordFilterFlags = (typeof KeywordFilterFlags)[keyof typeof KeywordFilterFlags];

export interface KeywordFilter {
	/** unique identifier for this filter */
	id?: string;
	/** epoch milliseconds after which this filter no longer applies */
	expiresAt?: number;
	/** pattern to match */
	pattern: RegExp;
	/** indicates how the filter should act */
	flags: number;
}

export const interpretMutedWordPreference = (pref: AppBskyActorDefs.MutedWord): KeywordFilter => {
	const { actorTarget, expiresAt, targets } = pref;

	let flags = 0;

	if (targets.includes('content')) {
		flags |= KeywordFilterFlags.ApplyContent;
	}
	if (targets.includes('tag')) {
		flags |= KeywordFilterFlags.ApplyTopic;
	}

	if (actorTarget === 'exclude-following') {
		flags |= KeywordFilterFlags.NoFollowing;
	}

	let expiry: number | undefined;
	if (expiresAt !== undefined) {
		const ts = Date.parse(expiresAt);
		if (!Number.isNaN(ts)) {
			expiry = ts;
		}
	}

	return {
		id: pref.id,
		expiresAt: expiry,
		pattern: createKeywordPattern({ value: pref.value, whole: true }),
		flags: flags,
	};
};

export const interpretMutedWordPreferences = (pref: AppBskyActorDefs.MutedWordsPref): KeywordFilter[] => {
	return pref.items.map((item) => interpretMutedWordPreference(item));
};
