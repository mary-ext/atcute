import { isCanonicalResourceUri, parseCanonicalResourceUri } from '@atcute/lexicons';

import { LabelTarget } from '../behaviors.ts';
import { type ModerationDecision, considerLabels, createModerationDecision } from '../decision.ts';
import type { ExternalViewSubject, ModerationOptions } from '../types.ts';

/**
 * moderates labels on an external view.
 *
 * uses the first associated record's owner as `authorDid`, or `undefined` if its URI is absent or
 * non-canonical.
 *
 * @param subject external view to moderate
 * @param opts moderation options
 * @returns moderation decision for the external view
 */
export const moderateExternalView = (
	subject: ExternalViewSubject,
	opts: ModerationOptions,
): ModerationDecision => {
	const uri = subject.associatedRefs?.[0]?.uri;
	const ownerDid = isCanonicalResourceUri(uri) ? parseCanonicalResourceUri(uri).repo : undefined;

	const decision = createModerationDecision(ownerDid, opts);
	considerLabels(decision, LabelTarget.Content, subject.labels, opts);

	return decision;
};
