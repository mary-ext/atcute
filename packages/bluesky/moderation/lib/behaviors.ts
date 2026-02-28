export const LabelTarget = {
	/** label is intended for account's content */
	Content: 'content',
	/** label is intended for account's profile */
	Profile: 'profile',
	/** label is intended for account's content and profile */
	Account: 'account',
} as const;
export type LabelTarget = (typeof LabelTarget)[keyof typeof LabelTarget];

export const DisplayContext = {
	/** content in expanded view */
	ContentView: 'contentView',
	/** images or video contained in content */
	ContentMedia: 'contentMedia',
	/** content in a list/feed */
	ContentList: 'contentList',

	/** profile in expanded view */
	ProfileView: 'profileView',
	/** profile's avatar or banner */
	ProfileMedia: 'profileMedia',
	/** profile in a list */
	ProfileList: 'profileList',
} as const;
export type DisplayContext = (typeof DisplayContext)[keyof typeof DisplayContext];

export const ModerationAction = {
	/** should cause blurring */
	Blur: 'blur',
	/** should cause an alert */
	Alert: 'alert',
	/** should cause a notice */
	Inform: 'inform',
} as const;
export type ModerationAction = (typeof ModerationAction)[keyof typeof ModerationAction];

export type BehaviorMapping = { [C in DisplayContext]?: ModerationAction };
export type LabelBehaviorMatrix = { [T in LabelTarget]: BehaviorMapping };

export const BLOCK_BEHAVIOR: BehaviorMapping = {
	[DisplayContext.ProfileList]: ModerationAction.Blur,
	[DisplayContext.ProfileView]: ModerationAction.Alert,
	[DisplayContext.ProfileMedia]: ModerationAction.Blur,

	[DisplayContext.ContentList]: ModerationAction.Blur,
	[DisplayContext.ContentView]: ModerationAction.Blur,
};

export const MUTE_BEHAVIOR: BehaviorMapping = {
	[DisplayContext.ProfileList]: ModerationAction.Inform,
	[DisplayContext.ProfileView]: ModerationAction.Alert,

	[DisplayContext.ContentList]: ModerationAction.Blur,
	[DisplayContext.ContentView]: ModerationAction.Inform,
};

export const KEYWORD_MUTE_BEHAVIOR: BehaviorMapping = {
	[DisplayContext.ContentList]: ModerationAction.Blur,
	[DisplayContext.ContentView]: ModerationAction.Blur,
};

export const HIDE_BEHAVIOR: BehaviorMapping = {
	[DisplayContext.ContentList]: ModerationAction.Blur,
	[DisplayContext.ContentView]: ModerationAction.Blur,
};

export const NOOP_BEHAVIOR: BehaviorMapping = {};
