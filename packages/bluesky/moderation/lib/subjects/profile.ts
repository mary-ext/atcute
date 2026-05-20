import { LabelTarget } from '../behaviors.ts';
import {
	type ModerationDecision,
	considerBlockedBy,
	considerBlocking,
	considerLabel,
	considerPermanentMute,
	createModerationDecision,
} from '../decision.ts';
import type { ModerationOptions, ProfileSubject } from '../types.ts';

export const moderateProfile = (subject: ProfileSubject, opts: ModerationOptions): ModerationDecision => {
	const decision = createModerationDecision(subject.did, opts);

	const viewer = subject.viewer;
	if (viewer) {
		if (viewer.muted) {
			considerPermanentMute(decision, viewer.mutedByList ?? null);
		}

		if (viewer.blocking) {
			considerBlocking(decision, viewer.blockingByList ?? null);
		}

		if (viewer.blockedBy) {
			considerBlockedBy(decision);
		}
	}

	if (subject.labels?.length) {
		for (const label of subject.labels) {
			const target =
				!label.uri.endsWith('/app.bsky.actor.profile/self') || label.val === '!no-unauthenticated'
					? LabelTarget.Account
					: LabelTarget.Profile;

			considerLabel(decision, target, label, opts);
		}
	}

	return decision;
};
