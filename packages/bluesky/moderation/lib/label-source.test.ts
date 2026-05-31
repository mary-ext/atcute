import { describe, expect, it } from 'vitest';

import * as m from './_test-util/mock.ts';
import {
	type LabelModerationCause,
	ModerationCauseType,
	type ModerationOptions,
	moderateProfile,
} from './index.ts';

const findLabelCause = (causes: { type: ModerationCauseType }[]) => {
	return causes.find((cause): cause is LabelModerationCause => cause.type === ModerationCauseType.Label);
};

describe('label cause source', () => {
	it('carries the labeler did for labeler-applied labels', () => {
		const profile = m.profileView({
			handle: 'alice.test',
			labels: [m.label({ val: 'porn', uri: 'did:web:alice.test', src: 'did:web:labeler.test' })],
		});
		const opts: ModerationOptions = {
			viewerDid: 'did:web:self.test',
			prefs: {
				adultContentEnabled: true,
				prefsByLabelers: { 'did:web:labeler.test': { labelPrefs: {} } },
			},
		};

		const cause = findLabelCause(moderateProfile(profile, opts).causes);
		expect(cause?.source).toBe('did:web:labeler.test');
	});

	it('is null for self-applied labels', () => {
		const profile = m.profileView({
			handle: 'alice.test',
			labels: [m.label({ val: 'porn', uri: 'did:web:alice.test', src: 'did:web:alice.test' })],
		});
		const opts: ModerationOptions = {
			viewerDid: 'did:web:self.test',
			prefs: { adultContentEnabled: true },
		};

		const cause = findLabelCause(moderateProfile(profile, opts).causes);
		expect(cause?.source).toBe(null);
	});
});
