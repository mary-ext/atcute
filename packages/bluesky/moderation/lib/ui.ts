import {
	BLOCK_BEHAVIOR,
	DisplayContext,
	HIDE_BEHAVIOR,
	KEYWORD_MUTE_BEHAVIOR,
	LabelTarget,
	MUTE_BEHAVIOR,
	ModerationAction,
} from './behaviors.ts';
import { type ModerationCause, ModerationCauseType, type ModerationDecision } from './decision.ts';
import { LabelPreference } from './label.ts';

export interface DisplayRestrictions {
	noOverride: boolean;
	filters: ModerationCause[];
	blurs: ModerationCause[];
	alerts: ModerationCause[];
	informs: ModerationCause[];
}

export const getDisplayRestrictions = (
	decision: ModerationDecision,
	context: DisplayContext,
): DisplayRestrictions => {
	const filters: ModerationCause[] = [];
	const blurs: ModerationCause[] = [];
	const alerts: ModerationCause[] = [];
	const informs: ModerationCause[] = [];

	let noOverride: boolean = false;

	for (const cause of decision.causes) {
		switch (cause.type) {
			case ModerationCauseType.Label: {
				if (cause.pref === LabelPreference.Hide && !decision.isMe) {
					if (context === DisplayContext.ProfileList && cause.target == LabelTarget.Account) {
						filters.push(cause);
					} else if (
						context === DisplayContext.ContentList &&
						(cause.target === LabelTarget.Account || cause.target === LabelTarget.Content)
					) {
						filters.push(cause);
					}
				}

				if (!cause.downgraded) {
					switch (cause.behavior[context]) {
						case ModerationAction.Blur: {
							noOverride ||= cause.noOverride && !decision.isMe;
							blurs.push(cause);
							break;
						}
						case ModerationAction.Alert: {
							alerts.push(cause);
							break;
						}
						case ModerationAction.Inform: {
							informs.push(cause);
							break;
						}
					}
				}

				break;
			}

			case ModerationCauseType.MutedPermanent:
			case ModerationCauseType.MutedTemporary: {
				if (context === DisplayContext.ProfileList || context === DisplayContext.ContentList) {
					filters.push(cause);
				}

				if (!cause.downgraded) {
					switch (MUTE_BEHAVIOR[context]) {
						case ModerationAction.Blur: {
							blurs.push(cause);
							break;
						}
						case ModerationAction.Alert: {
							alerts.push(cause);
							break;
						}
						case ModerationAction.Inform: {
							informs.push(cause);
							break;
						}
					}
				}

				break;
			}

			case ModerationCauseType.MutedKeyword: {
				if (context === DisplayContext.ContentList) {
					filters.push(cause);
				}

				if (!cause.downgraded) {
					switch (KEYWORD_MUTE_BEHAVIOR[context]) {
						case ModerationAction.Blur: {
							blurs.push(cause);
							break;
						}
						case ModerationAction.Alert: {
							alerts.push(cause);
							break;
						}
						case ModerationAction.Inform: {
							informs.push(cause);
							break;
						}
					}
				}

				break;
			}

			case ModerationCauseType.Hidden: {
				if (context === DisplayContext.ProfileList || context === DisplayContext.ContentList) {
					filters.push(cause);
				}

				if (!cause.downgraded) {
					switch (HIDE_BEHAVIOR[context]) {
						case ModerationAction.Blur: {
							blurs.push(cause);
							break;
						}
						case ModerationAction.Alert: {
							alerts.push(cause);
							break;
						}
						case ModerationAction.Inform: {
							informs.push(cause);
							break;
						}
					}
				}

				break;
			}

			case ModerationCauseType.BlockedBy:
			case ModerationCauseType.Blocking: {
				if (context === DisplayContext.ProfileList || context === DisplayContext.ContentList) {
					filters.push(cause);
				}

				if (!cause.downgraded) {
					switch (BLOCK_BEHAVIOR[context]) {
						case ModerationAction.Blur: {
							noOverride = true;
							blurs.push(cause);
							break;
						}
						case ModerationAction.Alert: {
							alerts.push(cause);
							break;
						}
						case ModerationAction.Inform: {
							informs.push(cause);
							break;
						}
					}
				}

				break;
			}
		}
	}

	return {
		noOverride,
		filters: filters.sort(sortByPriority), // oxlint-disable-line unicorn/no-array-sort -- local array
		blurs: blurs.sort(sortByPriority), // oxlint-disable-line unicorn/no-array-sort -- local array
		alerts: alerts.sort(sortByPriority), // oxlint-disable-line unicorn/no-array-sort -- local array
		informs: informs.sort(sortByPriority), // oxlint-disable-line unicorn/no-array-sort -- local array
	};
};

const sortByPriority = (a: ModerationCause, b: ModerationCause) => {
	return a.priority - b.priority;
};
