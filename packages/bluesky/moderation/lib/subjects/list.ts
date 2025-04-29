import type { At } from '@atcute/client/lexicons';
import { LabelTarget } from '../behaviors.js';
import {
	considerLabels,
	createModerationDecision,
	mergeModerationDecisions,
	type ModerationDecision,
} from '../decision.js';
import type { ModerationOptions, ListSubject } from '../types.js';

import { moderateProfile } from './profile.js';

const ATURI_RE = /^at:\/\/([a-zA-Z0-9._:%-]+)\//;

export const moderateList = (subject: ListSubject, opts: ModerationOptions): ModerationDecision => {
	if ('creator' in subject) {
		const creator = subject.creator;

		const decision = createModerationDecision(creator.did, opts);
		considerLabels(decision, LabelTarget.Content, subject.labels, opts);

		return mergeModerationDecisions(decision, moderateProfile(creator, opts));
	} else {
		let creatorDid: At.Did;

		// TODO: can we have @atcute/syntax yet
		{
			const match = ATURI_RE.exec(subject.uri);
			if (!match) {
				throw new Error(`can't parse at-uri from user list`);
			}

			creatorDid = match[1] as At.Did;
		}

		const decision = createModerationDecision(creatorDid, opts);
		considerLabels(decision, LabelTarget.Content, subject.labels, opts);

		return decision;
	}
};
