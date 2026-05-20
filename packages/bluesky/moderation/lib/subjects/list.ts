import { parseCanonicalResourceUri } from '@atcute/lexicons';

import { LabelTarget } from '../behaviors.ts';
import {
	type ModerationDecision,
	considerLabels,
	createModerationDecision,
	mergeModerationDecisions,
} from '../decision.ts';
import type { ListSubject, ModerationOptions } from '../types.ts';

import { moderateProfile } from './profile.ts';

export const moderateList = (subject: ListSubject, opts: ModerationOptions): ModerationDecision => {
	if ('creator' in subject) {
		const creator = subject.creator;

		const decision = createModerationDecision(creator.did, opts);
		considerLabels(decision, LabelTarget.Content, subject.labels, opts);

		return mergeModerationDecisions(decision, moderateProfile(creator, opts));
	} else {
		const creatorDid = parseCanonicalResourceUri(subject.uri).repo;

		const decision = createModerationDecision(creatorDid, opts);
		considerLabels(decision, LabelTarget.Content, subject.labels, opts);

		return decision;
	}
};
