import { describe, expect, it } from 'vitest';

import * as m from './_test-util/mock.ts';
import { ModerationCauseType, type ModerationOptions, moderatePost } from './index.ts';

const opts: ModerationOptions = {
	viewerDid: 'did:web:self.test',
	prefs: {},
};

const subjectWithBlockedQuote = (viewer: ReturnType<typeof m.actorViewerState>) => {
	return m.postView({
		record: m.post({ text: 'hello' }),
		author: m.profileView({ handle: 'alice.test' }),
		embed: m.embedRecordBlockedView({ did: 'did:web:bob.test', viewer }),
	});
};

describe('blocked quote posts', () => {
	it('considers a muted author behind a blocked quote', () => {
		const res = moderatePost(subjectWithBlockedQuote(m.actorViewerState({ muted: true })), opts);
		expect(res.causes.some((cause) => cause.type === ModerationCauseType.MutedPermanent)).toBe(true);
	});

	it('considers a blocking author behind a blocked quote', () => {
		const res = moderatePost(
			subjectWithBlockedQuote(
				m.actorViewerState({ blocking: 'at://did:web:self.test/app.bsky.graph.block/fake' }),
			),
			opts,
		);
		expect(res.causes.some((cause) => cause.type === ModerationCauseType.Blocking)).toBe(true);
	});
});
