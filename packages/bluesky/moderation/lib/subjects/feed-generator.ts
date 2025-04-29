import { LabelTarget } from '../behaviors.js';
import {
	considerLabels,
	createModerationDecision,
	mergeModerationDecisions,
	type ModerationDecision,
} from '../decision.js';
import type { FeedGeneratorSubject, ModerationOptions } from '../types.js';

import { moderateProfile } from './profile.js';

export const moderateFeedGenerator = (
	subject: FeedGeneratorSubject,
	opts: ModerationOptions,
): ModerationDecision => {
	const creator = subject.creator;

	const decision = createModerationDecision(creator.did, opts);
	considerLabels(decision, LabelTarget.Content, subject.labels, opts);

	return mergeModerationDecisions(decision, moderateProfile(creator, opts));
};
