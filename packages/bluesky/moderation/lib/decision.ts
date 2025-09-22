import type { AppBskyGraphDefs } from '@atcute/bluesky';
import type { Did } from '@atcute/lexicons';

import { DisplayContext, ModerationAction, type BehaviorMapping, type LabelTarget } from './behaviors.js';
import type { Label, LabelerPreference, ModerationOptions } from './types.js';

import type { KeywordFilter } from './keyword-filter.js';
import {
	BUILTIN_LABELS,
	isCustomLabelValue,
	LabelFlags,
	LabelPreference,
	type InterpretedLabelDefinition,
} from './label.js';

const enum ModerationSeverity {
	High = 1,
	Medium = 2,
	Low = 3,
}

export enum ModerationCauseType {
	/** caused by a label */
	Label = 1,
	/** caused by viewer blocking the subject */
	Blocking = 2,
	/** caused by subject blocking the viewer */
	BlockedBy = 3,
	/** caused by viewer having a (permanent) mute on subject */
	MutedPermanent = 4,
	/** caused by a temporary mute */
	MutedTemporary = 5,
	/** caused by a keyword mute */
	MutedKeyword = 6,
	/** caused by a hidden post */
	Hidden = 7,
}

export interface BlockingModerationCause {
	type: ModerationCauseType.Blocking;
	priority: 3;
	source: AppBskyGraphDefs.ListViewBasic | null;

	downgraded: boolean;
}

export interface BlockedByModerationCause {
	type: ModerationCauseType.BlockedBy;
	priority: 4;

	downgraded: boolean;
}

export interface HiddenModerationCause {
	type: ModerationCauseType.Hidden;
	priority: 6;

	downgraded: boolean;
}

export interface LabelModerationCause {
	type: ModerationCauseType.Label;
	priority: 1 | 2 | 5 | 7 | 8;
	source: Did | null;

	label: Label;
	labelDef: InterpretedLabelDefinition;

	target: LabelTarget;
	pref: LabelPreference;
	behavior: BehaviorMapping;

	noOverride: boolean;
	downgraded: boolean;
}

export interface MutedPermanentModerationCause {
	type: ModerationCauseType.MutedPermanent;
	priority: 6;
	source: AppBskyGraphDefs.ListViewBasic | null;

	downgraded: boolean;
}

export interface MutedTemporaryModerationCause {
	type: ModerationCauseType.MutedTemporary;
	priority: 6;

	downgraded: boolean;
}

export interface MutedKeywordModerationCause {
	type: ModerationCauseType.MutedKeyword;
	priority: 6;
	source: KeywordFilter;

	downgraded: boolean;
}

export type ModerationCause =
	| BlockedByModerationCause
	| BlockingModerationCause
	| HiddenModerationCause
	| LabelModerationCause
	| MutedKeywordModerationCause
	| MutedPermanentModerationCause
	| MutedTemporaryModerationCause;

export interface ModerationDecision {
	authorDid: Did;
	isMe: boolean;
	causes: ModerationCause[];
}

export const createModerationDecision = (
	authorDid: Did,
	{ viewerDid }: ModerationOptions,
): ModerationDecision => {
	return {
		authorDid: authorDid,
		isMe: authorDid === viewerDid,
		causes: [],
	};
};

type FalsyValue = 0 | '' | false | null | undefined;
export const mergeModerationDecisions = (
	...sources: [ModerationDecision, ModerationDecision | FalsyValue, ...(ModerationDecision | FalsyValue)[]]
): ModerationDecision => {
	return {
		authorDid: sources[0].authorDid,
		isMe: sources[0].isMe,
		causes: sources.filter((source) => !!source).flatMap((source) => source.causes),
	};
};

export const considerHidden = (decision: ModerationDecision): void => {
	decision.causes.push({
		type: ModerationCauseType.Hidden,
		priority: 6,

		downgraded: false,
	});
};

export const considerBlocking = (
	decision: ModerationDecision,
	source: AppBskyGraphDefs.ListViewBasic | null,
): void => {
	if (decision.isMe) {
		return;
	}

	decision.causes.push({
		type: ModerationCauseType.Blocking,
		priority: 3,
		source: source,

		downgraded: false,
	});
};

export const considerBlockedBy = (decision: ModerationDecision): void => {
	if (decision.isMe) {
		return;
	}

	decision.causes.push({
		type: ModerationCauseType.BlockedBy,
		priority: 4,

		downgraded: false,
	});
};

export const considerPermanentMute = (
	decision: ModerationDecision,
	source: AppBskyGraphDefs.ListViewBasic | null,
): void => {
	if (decision.isMe) {
		return;
	}

	decision.causes.push({
		type: ModerationCauseType.MutedPermanent,
		priority: 6,
		source: source,

		downgraded: false,
	});
};

export const considerTemporaryMute = (decision: ModerationDecision, { prefs }: ModerationOptions): void => {
	if (decision.isMe) {
		return;
	}

	if (prefs.temporaryMutes?.includes(decision.authorDid)) {
		decision.causes.push({
			type: ModerationCauseType.MutedTemporary,
			priority: 6,

			downgraded: false,
		});
	}
};

export const considerKeywordMute = (decision: ModerationDecision, source: KeywordFilter): void => {
	decision.causes.push({
		type: ModerationCauseType.MutedKeyword,
		priority: 6,
		source: source,

		downgraded: false,
	});
};

export const considerLabels = (
	decision: ModerationDecision,
	target: LabelTarget,
	labels: Label[] | undefined,
	opts: ModerationOptions,
): void => {
	if (labels?.length) {
		for (let idx = 0, len = labels.length; idx < len; idx++) {
			considerLabel(decision, target, labels[idx], opts);
		}
	}
};

export const considerLabel = (
	decision: ModerationDecision,
	target: LabelTarget,
	label: Label,
	{ viewerDid, prefs, labelDefs }: ModerationOptions,
): void => {
	const { src, val } = label;

	/// 1. grab the label definition
	let labelDef: InterpretedLabelDefinition | undefined;

	if (isCustomLabelValue(val)) {
		labelDef = labelDefs?.[src]?.[val];
	}
	if (labelDef === undefined) {
		labelDef = BUILTIN_LABELS[val];
	}

	if (labelDef === undefined) {
		return;
	}

	/// 2. check applicability
	if (labelDef.flags & LabelFlags.UnauthenticatedOnly && viewerDid !== undefined) {
		// skip if label is only for signed-out users
		return;
	}

	const isConfigurable = !(labelDef.flags & LabelFlags.NoConfigurable);
	const isAdultOnly = !!(labelDef.flags & LabelFlags.AdultOnly);

	const isSelfApplied = src === decision.authorDid;

	let labelerPref: LabelerPreference | undefined;
	if (!isSelfApplied) {
		labelerPref = prefs.prefsByLabelers?.[src];

		if (labelerPref === undefined) {
			// skip if we're looking at an unconfigured labeler
			return;
		}
	} else {
		if (labelDef.flags & LabelFlags.NoSelf) {
			// skip if label is not allowed to be self-applied
			return;
		}
	}

	let pref: LabelPreference;
	if (isConfigurable) {
		if (isAdultOnly && !prefs.adultContentEnabled) {
			pref = LabelPreference.Hide;
		} else {
			pref = labelerPref?.labelPrefs[val] ?? prefs.globalLabelPrefs?.[val] ?? labelDef.defaultPref;
		}
	} else {
		pref = labelDef.defaultPref;
	}

	// skip if label is configured to ignore
	if (pref === LabelPreference.Ignore) {
		return;
	}

	const behavior = labelDef.behavior[target];

	const severity = getModerationSeverity(behavior);
	let priority: LabelModerationCause['priority'];

	if (labelDef.flags & LabelFlags.NoOverride || (isAdultOnly && !prefs.adultContentEnabled)) {
		priority = 1;
	} else if (pref === LabelPreference.Hide) {
		priority = 2;
	} else if (severity === ModerationSeverity.High) {
		priority = 5;
	} else if (severity === ModerationSeverity.Medium) {
		priority = 7;
	} else {
		priority = 8;
	}

	let noOverride = false;
	if (labelDef.flags & LabelFlags.NoOverride || (isAdultOnly && !prefs.adultContentEnabled)) {
		noOverride = true;
	}

	decision.causes.push({
		type: ModerationCauseType.Label,
		priority,
		source: isSelfApplied ? label.src : null,

		label: label,
		labelDef: labelDef,

		target: target,
		pref: pref,
		behavior: behavior,

		noOverride: noOverride,
		downgraded: false,
	});
};

const getModerationSeverity = (behavior: BehaviorMapping) => {
	if (
		behavior[DisplayContext.ProfileView] === ModerationAction.Blur ||
		behavior[DisplayContext.ContentView] === ModerationAction.Blur
	) {
		return ModerationSeverity.High;
	}

	if (
		behavior[DisplayContext.ContentList] === ModerationAction.Blur ||
		behavior[DisplayContext.ContentMedia] === ModerationAction.Blur
	) {
		return ModerationSeverity.Medium;
	}

	return ModerationSeverity.Low;
};

export const downgradeDecision = <T extends ModerationDecision | undefined>(decision: T): T => {
	if (decision === undefined) {
		return decision;
	}

	const causes = decision.causes;
	for (let idx = 0, len = causes.length; idx < len; idx++) {
		const cause = causes[idx];
		cause.downgraded = true;
	}

	return decision;
};
