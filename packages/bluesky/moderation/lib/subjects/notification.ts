import { LabelTarget } from '../behaviors.ts';
import {
	type ModerationDecision,
	considerLabels,
	createModerationDecision,
	mergeModerationDecisions,
} from '../decision.ts';
import type { ModerationOptions, NotificationSubject } from '../types.ts';

import { moderateProfile } from './profile.ts';

export const moderateNotification = (
	subject: NotificationSubject,
	opts: ModerationOptions,
): ModerationDecision => {
	const author = subject.author;

	const decision = createModerationDecision(author.did, opts);
	considerLabels(decision, LabelTarget.Content, subject.labels, opts);

	return mergeModerationDecisions(decision, moderateProfile(author, opts));
};
