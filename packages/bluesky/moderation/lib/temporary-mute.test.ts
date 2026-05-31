import { describe, expect, it } from 'vitest';

import * as m from './_test-util/mock.ts';
import { ModerationCauseType, moderateProfile } from './index.ts';

const isTempMuted = (causes: { type: ModerationCauseType }[]) => {
	return causes.some((cause) => cause.type === ModerationCauseType.MutedTemporary);
};

describe('temporary mutes', () => {
	const profile = m.profileView({ handle: 'alice.test' });

	it('mutes an author listed in temporaryMutes', () => {
		const res = moderateProfile(profile, {
			viewerDid: 'did:web:self.test',
			prefs: { temporaryMutes: [profile.did] },
		});
		expect(isTempMuted(res.causes)).toBe(true);
	});

	it('does not mute an author that is not listed', () => {
		const res = moderateProfile(profile, {
			viewerDid: 'did:web:self.test',
			prefs: { temporaryMutes: [] },
		});
		expect(isTempMuted(res.causes)).toBe(false);
	});

	it('does not mute the viewer themselves', () => {
		const res = moderateProfile(profile, {
			viewerDid: profile.did,
			prefs: { temporaryMutes: [profile.did] },
		});
		expect(isTempMuted(res.causes)).toBe(false);
	});
});
