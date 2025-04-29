import type {
	AppBskyActorDefs,
	AppBskyFeedDefs,
	AppBskyGraphDefs,
	AppBskyNotificationListNotifications,
	At,
	ChatBskyActorDefs,
	ComAtprotoLabelDefs,
} from '@atcute/client/lexicons';

import type { KeywordFilter } from './keyword-filter.js';
import type { InterpretedLabelMapping, LabelPreference } from './label.js';

export type Label = ComAtprotoLabelDefs.Label;

export interface LabelerPreference {
	/** preferences for labels issued by this labeler */
	labelPrefs: Record<string, LabelPreference | undefined>;
}

export interface ModerationPreferences {
	/** whether adult content is allowed to be shown */
	adultContentEnabled?: boolean;

	/** preferences for global-defined labels */
	globalLabelPrefs?: Record<string, LabelPreference | undefined>;
	/** preferences for labelers */
	prefsByLabelers?: { [D in At.Did]?: LabelerPreference };

	/** list of hidden posts */
	hiddenPosts?: At.CanonicalResourceUri[];
	/** list of temporarily muted users */
	temporaryMutes?: At.Did[];

	/** list of keyword filters */
	keywordFilters?: KeywordFilter[];
}

export interface ModerationOptions {
	/** DID of the viewer */
	viewerDid: At.Did | undefined;
	/** moderation preferences */
	prefs: ModerationPreferences;

	/** interpreted label definitions from labelers */
	labelDefs?: { [D in At.Did]?: InterpretedLabelMapping };
}

export type FeedGeneratorSubject = AppBskyFeedDefs.GeneratorView;

export type ListSubject = AppBskyGraphDefs.ListView | AppBskyGraphDefs.ListViewBasic;

export type NotificationSubject = AppBskyNotificationListNotifications.Notification;

export type PostSubject = AppBskyFeedDefs.PostView;

export type ProfileSubject =
	| AppBskyActorDefs.ProfileViewBasic
	| AppBskyActorDefs.ProfileView
	| AppBskyActorDefs.ProfileViewDetailed
	| ChatBskyActorDefs.ProfileViewBasic;
