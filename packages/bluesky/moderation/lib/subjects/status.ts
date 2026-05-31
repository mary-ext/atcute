import { LabelTarget } from '../behaviors.ts';
import {
	type ModerationDecision,
	considerLabels,
	createModerationDecision,
	mergeModerationDecisions,
} from '../decision.ts';
import type { ModerationOptions, ProfileSubject } from '../types.ts';

import { moderateProfile } from './profile.ts';

export const moderateStatus = (subject: ProfileSubject, opts: ModerationOptions): ModerationDecision => {
	const status = 'status' in subject ? subject.status : undefined;

	const decision = createModerationDecision(subject.did, opts);
	considerLabels(decision, LabelTarget.Content, status?.labels, opts);

	return mergeModerationDecisions(decision, moderateProfile(subject, opts));
};
