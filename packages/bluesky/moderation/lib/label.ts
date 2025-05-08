import type { ComAtprotoLabelDefs } from '@atcute/atproto';
import type { AppBskyLabelerDefs } from '@atcute/bluesky';
import type { Did } from '@atcute/lexicons';

import { DisplayContext, LabelTarget, ModerationAction, type LabelBehaviorMatrix } from './behaviors.js';

export const enum LabelPreference {
	/** ignore this label */
	Ignore = 'ignore',
	/** warn when viewing content or profile with this label */
	Warn = 'warn',
	/** hide content or profile containing this label */
	Hide = 'hide',
}

export const enum LabelFlags {
	/** no flags */
	None = 0,

	/** unblurring shouldn't be allowed */
	NoOverride = 1 << 0,
	/** label can't be configured */
	NoConfigurable = 1 << 1,
	/** label can't be applied as a self-label */
	NoSelf = 1 << 2,
	/** label is adult-only */
	AdultOnly = 1 << 3,
	/** label can't be applied if authenticated */
	UnauthenticatedOnly = 1 << 4,
}

export const enum BlurLevel {
	/** don't blur any parts of the content */
	None = 'none',
	/** only blur the media present in the content */
	Media = 'media',
	/** blur the entire content */
	Content = 'content',

	/** special blur value, guaranteed blurring of profile and content */
	Forced = 'forced',
}

export const enum SeverityLevel {
	/** don't inform the user */
	None = 'none',
	/** lightly inform the user about this label's presence */
	Inform = 'inform',
	/** alert the user about this label's presence */
	Alert = 'alert',
}

export interface LabelLocale {
	/** language code */
	lang: string;
	/** label name */
	name: string;
	/** label description */
	description: string;
}

export interface InterpretedLabelDefinition {
	/** label identifier */
	identifier: string;
	/** default preference */
	defaultPref: LabelPreference;
	/** how the content should be blurred */
	blur: BlurLevel;
	/** how the content should be informed */
	severity: SeverityLevel;
	/** additional flags for this label */
	flags: number;
	/** behavior matrix */
	behavior: LabelBehaviorMatrix;
	/** localization for the label */
	locales: LabelLocale[];
}

export type InterpretedLabelMapping = Record<string, InterpretedLabelDefinition>;

export const getLabelBehaviorMatrix = (
	blur: BlurLevel,
	severity: SeverityLevel,
	flags: number,
): LabelBehaviorMatrix => {
	const hasAdultFlag = !!(flags & LabelFlags.AdultOnly);

	let alertOrInform: ModerationAction | undefined;
	switch (severity) {
		case SeverityLevel.Alert: {
			alertOrInform = ModerationAction.Alert;
			break;
		}
		case SeverityLevel.Inform: {
			alertOrInform = ModerationAction.Inform;
			break;
		}
	}

	switch (blur) {
		case BlurLevel.Forced: {
			return {
				[LabelTarget.Account]: {
					[DisplayContext.ProfileList]: ModerationAction.Blur,
					[DisplayContext.ProfileView]: ModerationAction.Blur,
					[DisplayContext.ProfileMedia]: ModerationAction.Blur,
					[DisplayContext.ContentList]: ModerationAction.Blur,
					[DisplayContext.ContentView]: ModerationAction.Blur,
				},
				[LabelTarget.Profile]: {
					[DisplayContext.ProfileMedia]: ModerationAction.Blur,
				},
				[LabelTarget.Content]: {
					[DisplayContext.ContentList]: ModerationAction.Blur,
					[DisplayContext.ContentView]: ModerationAction.Blur,
				},
			};
		}
		case BlurLevel.Content: {
			return {
				[LabelTarget.Account]: {
					[DisplayContext.ProfileList]: alertOrInform,
					[DisplayContext.ProfileView]: alertOrInform,

					[DisplayContext.ContentList]: ModerationAction.Blur,
					[DisplayContext.ContentView]: hasAdultFlag ? ModerationAction.Blur : alertOrInform,
				},
				[LabelTarget.Profile]: {
					[DisplayContext.ProfileList]: alertOrInform,
					[DisplayContext.ProfileView]: alertOrInform,
				},
				[LabelTarget.Content]: {
					[DisplayContext.ContentList]: ModerationAction.Blur,
					[DisplayContext.ContentView]: hasAdultFlag ? ModerationAction.Blur : alertOrInform,
				},
			};
		}
		case BlurLevel.Media: {
			return {
				[LabelTarget.Account]: {
					[DisplayContext.ProfileList]: alertOrInform,
					[DisplayContext.ProfileView]: alertOrInform,
					[DisplayContext.ProfileMedia]: ModerationAction.Blur,
				},
				[LabelTarget.Profile]: {
					[DisplayContext.ProfileList]: alertOrInform,
					[DisplayContext.ProfileView]: alertOrInform,
					[DisplayContext.ProfileMedia]: ModerationAction.Blur,
				},
				[LabelTarget.Content]: {
					[DisplayContext.ContentMedia]: ModerationAction.Blur,
				},
			};
		}
		case BlurLevel.None: {
			return {
				[LabelTarget.Account]: {
					[DisplayContext.ProfileList]: alertOrInform,
					[DisplayContext.ProfileView]: alertOrInform,

					[DisplayContext.ContentList]: alertOrInform,
					[DisplayContext.ContentView]: alertOrInform,
				},
				[LabelTarget.Profile]: {
					[DisplayContext.ProfileList]: alertOrInform,
					[DisplayContext.ProfileView]: alertOrInform,
				},
				[LabelTarget.Content]: {
					[DisplayContext.ContentList]: alertOrInform,
					[DisplayContext.ContentView]: alertOrInform,
				},
			};
		}
	}
};

const FORCED_BEHAVIOR = /*#__PURE__*/ getLabelBehaviorMatrix(BlurLevel.Forced, SeverityLevel.None, 0);
const NSFW_BEHAVIOR = /*#__PURE__*/ getLabelBehaviorMatrix(BlurLevel.Media, SeverityLevel.None, 0);

export const BUILTIN_LABELS: InterpretedLabelMapping = {
	'!hide': {
		identifier: '!hide',
		defaultPref: LabelPreference.Hide,
		blur: BlurLevel.Forced,
		severity: SeverityLevel.Alert,
		flags: LabelFlags.NoOverride | LabelFlags.NoConfigurable | LabelFlags.NoSelf,
		behavior: FORCED_BEHAVIOR,
		locales: [],
	},
	'!warn': {
		identifier: '!warn',
		defaultPref: LabelPreference.Warn,
		blur: BlurLevel.Forced,
		severity: SeverityLevel.None,
		flags: LabelFlags.NoConfigurable | LabelFlags.NoSelf,
		behavior: FORCED_BEHAVIOR,
		locales: [],
	},
	'!no-unauthenticated': {
		identifier: '!no-unauthenticated',
		defaultPref: LabelPreference.Hide,
		blur: BlurLevel.Forced,
		severity: SeverityLevel.None,
		flags: LabelFlags.NoOverride | LabelFlags.NoConfigurable | LabelFlags.UnauthenticatedOnly,
		behavior: FORCED_BEHAVIOR,
		locales: [],
	},

	porn: {
		identifier: 'porn',
		defaultPref: LabelPreference.Warn,
		blur: BlurLevel.Media,
		severity: SeverityLevel.None,
		flags: LabelFlags.AdultOnly,
		behavior: NSFW_BEHAVIOR,
		locales: [],
	},
	sexual: {
		identifier: 'sexual',
		defaultPref: LabelPreference.Warn,
		blur: BlurLevel.Media,
		severity: SeverityLevel.None,
		flags: LabelFlags.AdultOnly,
		behavior: NSFW_BEHAVIOR,
		locales: [],
	},
	'graphic-media': {
		identifier: 'graphic-media',
		defaultPref: LabelPreference.Warn,
		blur: BlurLevel.Media,
		severity: SeverityLevel.None,
		flags: LabelFlags.AdultOnly,
		behavior: NSFW_BEHAVIOR,
		locales: [],
	},
	nudity: {
		identifier: 'nudity',
		defaultPref: LabelPreference.Warn,
		blur: BlurLevel.Media,
		severity: SeverityLevel.None,
		flags: LabelFlags.AdultOnly,
		behavior: NSFW_BEHAVIOR,
		locales: [],
	},
};

const CUSTOM_LABEL_RE = /^[a-z-]+$/;

export const isCustomLabelValue = (value: string): boolean => {
	return CUSTOM_LABEL_RE.test(value);
};

export const interpretLabelValueDefinition = (
	def: ComAtprotoLabelDefs.LabelValueDefinition,
): InterpretedLabelDefinition => {
	let defaultPref = LabelPreference.Warn;
	let blur = BlurLevel.None;
	let severity = SeverityLevel.None;
	let flags = LabelFlags.NoSelf;

	switch (def.blurs) {
		case 'content': {
			blur = BlurLevel.Content;
			break;
		}
		case 'media': {
			blur = BlurLevel.Media;
			break;
		}
	}

	switch (def.severity) {
		case 'alert': {
			severity = SeverityLevel.Alert;
			break;
		}
		case 'inform': {
			severity = SeverityLevel.Inform;
			break;
		}
	}

	switch (def.defaultSetting) {
		case 'hide': {
			defaultPref = LabelPreference.Hide;
			break;
		}
		case 'ignore': {
			defaultPref = LabelPreference.Ignore;
			break;
		}
	}

	if (def.adultOnly) {
		flags |= LabelFlags.AdultOnly;
	}

	return {
		identifier: def.identifier,
		blur: blur,
		severity: severity,
		flags: flags,
		behavior: getLabelBehaviorMatrix(blur, severity, flags),
		defaultPref: defaultPref,
		locales: def.locales.map((locale) => ({
			name: locale.name,
			lang: locale.lang,
			description: locale.description,
		})),
	};
};

export const interpretLabelerDefinition = (
	labeler: AppBskyLabelerDefs.LabelerViewDetailed,
): InterpretedLabelMapping => {
	const { labelValues, labelValueDefinitions = [] } = labeler.policies;

	const mapping: InterpretedLabelMapping = {};

	for (const definition of labelValueDefinitions) {
		const identifier = definition.identifier;

		// skip if it's not a valid custom label identifier
		if (!isCustomLabelValue(identifier)) {
			continue;
		}

		// skip if it's not listed in `labelValues`
		//
		// `labelValues` controls how Bluesky app should display the label
		// preferences, and by omitting it, users can't configure the label.
		//
		// in my understanding, this should be invalid. labels should always be
		// configurable. the only exception being enforced regional labelers.
		if (!labelValues.includes(identifier)) {
			continue;
		}

		mapping[identifier] = interpretLabelValueDefinition(definition);
	}

	return mapping;
};

export const interpretLabelerDefinitions = (
	labelers: AppBskyLabelerDefs.LabelerViewDetailed[],
): Record<Did, InterpretedLabelMapping> => {
	const labelDefs: Record<Did, InterpretedLabelMapping> = {};

	for (const labeler of labelers) {
		labelDefs[labeler.creator.did] = interpretLabelerDefinition(labeler);
	}

	return labelDefs;
};
