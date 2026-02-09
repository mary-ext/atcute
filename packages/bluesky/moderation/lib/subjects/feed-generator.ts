import { LabelTarget } from '../behaviors.ts';
import {
	considerLabels,
	createModerationDecision,
	mergeModerationDecisions,
	type ModerationDecision,
} from '../decision.ts';
import type { FeedGeneratorSubject, ModerationOptions } from '../types.ts';

import { moderateProfile } from './profile.ts';

export const moderateFeedGenerator = (
	subject: FeedGeneratorSubject,
	opts: ModerationOptions,
): ModerationDecision => {
	const creator = subject.creator;

	const decision = createModerationDecision(creator.did, opts);
	considerLabels(decision, LabelTarget.Content, subject.labels, opts);

	return mergeModerationDecisions(decision, moderateProfile(creator, opts));
};
