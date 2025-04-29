import { LabelTarget } from '../behaviors.js';
import {
	considerLabels,
	createModerationDecision,
	mergeModerationDecisions,
	type ModerationDecision,
} from '../decision.js';
import type { ModerationOptions, NotificationSubject } from '../types.js';

import { moderateProfile } from './profile.js';

export const moderateNotification = (
	subject: NotificationSubject,
	opts: ModerationOptions,
): ModerationDecision => {
	const author = subject.author;

	const decision = createModerationDecision(author.did, opts);
	considerLabels(decision, LabelTarget.Content, subject.labels, opts);

	return mergeModerationDecisions(decision, moderateProfile(author, opts));
};
