import { parseCanonicalResourceUri } from '@atcute/lexicons';

import { LabelTarget } from '../behaviors.js';
import {
	considerLabels,
	createModerationDecision,
	mergeModerationDecisions,
	type ModerationDecision,
} from '../decision.js';
import type { ListSubject, ModerationOptions } from '../types.js';

import { moderateProfile } from './profile.js';

export const moderateList = (subject: ListSubject, opts: ModerationOptions): ModerationDecision => {
	if ('creator' in subject) {
		const creator = subject.creator;

		const decision = createModerationDecision(creator.did, opts);
		considerLabels(decision, LabelTarget.Content, subject.labels, opts);

		return mergeModerationDecisions(decision, moderateProfile(creator, opts));
	} else {
		const uri = parseCanonicalResourceUri(subject.uri);
		if (!uri.ok) {
			throw new Error(`can't parse at-uri from user list (${uri.error})`);
		}

		const creatorDid = uri.value.repo;

		const decision = createModerationDecision(creatorDid, opts);
		considerLabels(decision, LabelTarget.Content, subject.labels, opts);

		return decision;
	}
};
