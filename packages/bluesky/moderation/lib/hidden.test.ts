import type { CanonicalResourceUri } from '@atcute/lexicons';

import { describe, expect, it } from 'vitest';

import * as m from './_test-util/mock.ts';
import { ModerationCauseType, type ModerationOptions, moderatePost } from './index.ts';

const optsWithHidden = (hiddenPosts: CanonicalResourceUri[]): ModerationOptions => {
	return {
		viewerDid: 'did:web:self.test',
		prefs: { hiddenPosts },
	};
};

const isHidden = (causes: { type: ModerationCauseType }[]) => {
	return causes.some((cause) => cause.type === ModerationCauseType.Hidden);
};

describe('hidden posts', () => {
	const author = m.profileView({ handle: 'alice.test' });
	const quoteAuthor = m.profileView({ handle: 'bob.test' });
	const quotedUri = `at://${quoteAuthor.did}/app.bsky.feed.post/fake` as CanonicalResourceUri;

	const subject = m.postView({
		record: m.post({ text: 'hello' }),
		author,
		embed: m.embedRecordView({ record: m.post({ text: 'quoted' }), author: quoteAuthor }),
	});

	it('hides a post whose quoted post is in the hidden list', () => {
		const res = moderatePost(subject, optsWithHidden([quotedUri]));
		expect(isHidden(res.causes)).toBe(true);
	});

	it('does not hide when neither the post nor its quote is hidden', () => {
		const res = moderatePost(subject, optsWithHidden([]));
		expect(isHidden(res.causes)).toBe(false);
	});
});
