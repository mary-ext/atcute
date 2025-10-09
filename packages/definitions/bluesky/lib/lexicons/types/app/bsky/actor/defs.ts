import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyEmbedExternal from '../embed/external.js';
import * as AppBskyFeedPostgate from '../feed/postgate.js';
import * as AppBskyFeedThreadgate from '../feed/threadgate.js';
import * as AppBskyGraphDefs from '../graph/defs.js';
import * as AppBskyNotificationDefs from '../notification/defs.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';

const _adultContentPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#adultContentPref')),
	/**
	 * @default false
	 */
	enabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
});
const _bskyAppProgressGuideSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#bskyAppProgressGuide')),
	/**
	 * @maxLength 100
	 */
	guide: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
});
const _bskyAppStatePrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#bskyAppStatePref')),
	get activeProgressGuide() {
		return /*#__PURE__*/ v.optional(bskyAppProgressGuideSchema);
	},
	/**
	 * Storage for NUXs the user has encountered.
	 * @maxLength 100
	 */
	get nuxs() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(nuxSchema), [/*#__PURE__*/ v.arrayLength(0, 100)]),
		);
	},
	/**
	 * An array of tokens which identify nudges (modals, popups, tours, highlight dots) that should be shown to the user.
	 * @maxLength 1000
	 */
	queuedNudges: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
			),
			[/*#__PURE__*/ v.arrayLength(0, 1000)],
		),
	),
});
const _contentLabelPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#contentLabelPref')),
	label: /*#__PURE__*/ v.string(),
	/**
	 * Which labeler does this preference apply to? If undefined, applies globally.
	 */
	labelerDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	visibility: /*#__PURE__*/ v.string<'hide' | 'ignore' | 'show' | 'warn' | (string & {})>(),
});
const _feedViewPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#feedViewPref')),
	/**
	 * The URI of the feed, or an identifier which describes the feed.
	 */
	feed: /*#__PURE__*/ v.string(),
	/**
	 * Hide quote posts in the feed.
	 */
	hideQuotePosts: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * Hide replies in the feed.
	 */
	hideReplies: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * Hide replies in the feed if they do not have this number of likes.
	 */
	hideRepliesByLikeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * Hide replies in the feed if they are not by followed users.
	 * @default true
	 */
	hideRepliesByUnfollowed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
	/**
	 * Hide reposts in the feed.
	 */
	hideReposts: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _hiddenPostsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#hiddenPostsPref')),
	/**
	 * A list of URIs of posts the account owner has hidden.
	 */
	items: /*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()),
});
const _interestsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#interestsPref')),
	/**
	 * A list of tags which describe the account owner's interests gathered during onboarding.
	 * @maxLength 100
	 */
	tags: /*#__PURE__*/ v.constrain(
		/*#__PURE__*/ v.array(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 640),
				/*#__PURE__*/ v.stringGraphemes(0, 64),
			]),
		),
		[/*#__PURE__*/ v.arrayLength(0, 100)],
	),
});
const _knownFollowersSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#knownFollowers')),
	count: /*#__PURE__*/ v.integer(),
	/**
	 * @minLength 0
	 * @maxLength 5
	 */
	get followers() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(profileViewBasicSchema), [
			/*#__PURE__*/ v.arrayLength(0, 5),
		]);
	},
});
const _labelerPrefItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#labelerPrefItem')),
	did: /*#__PURE__*/ v.didString(),
});
const _labelersPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#labelersPref')),
	get labelers() {
		return /*#__PURE__*/ v.array(labelerPrefItemSchema);
	},
});
const _mutedWordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#mutedWord')),
	/**
	 * Groups of users to apply the muted word to. If undefined, applies to all users.
	 * @default "all"
	 */
	actorTarget: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'all' | 'exclude-following' | (string & {})>(),
		'all',
	),
	/**
	 * The date and time at which the muted word will expire and no longer be applied.
	 */
	expiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	id: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The intended targets of the muted word.
	 */
	get targets() {
		return /*#__PURE__*/ v.array(mutedWordTargetSchema);
	},
	/**
	 * The muted word itself.
	 * @maxLength 10000
	 * @maxGraphemes 1000
	 */
	value: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 10000),
		/*#__PURE__*/ v.stringGraphemes(0, 1000),
	]),
});
const _mutedWordTargetSchema = /*#__PURE__*/ v.constrain(
	/*#__PURE__*/ v.string<'content' | 'tag' | (string & {})>(),
	[/*#__PURE__*/ v.stringLength(0, 640), /*#__PURE__*/ v.stringGraphemes(0, 64)],
);
const _mutedWordsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#mutedWordsPref')),
	/**
	 * A list of words the account owner has muted.
	 */
	get items() {
		return /*#__PURE__*/ v.array(mutedWordSchema);
	},
});
const _nuxSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#nux')),
	/**
	 * @default false
	 */
	completed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	/**
	 * Arbitrary data for the NUX. The structure is defined by the NUX itself. Limited to 300 characters.
	 * @maxLength 3000
	 * @maxGraphemes 300
	 */
	data: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	),
	/**
	 * The date and time at which the NUX will expire and should be considered completed.
	 */
	expiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * @maxLength 100
	 */
	id: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
});
const _personalDetailsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#personalDetailsPref')),
	/**
	 * The birth date of account owner.
	 */
	birthDate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _postInteractionSettingsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#postInteractionSettingsPref')),
	/**
	 * Matches postgate record. List of rules defining who can embed this users posts. If value is an empty array or is undefined, no particular rules apply and anyone can embed.
	 * @maxLength 5
	 */
	get postgateEmbeddingRules() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([AppBskyFeedPostgate.disableRuleSchema])),
				[/*#__PURE__*/ v.arrayLength(0, 5)],
			),
		);
	},
	/**
	 * Matches threadgate record. List of rules defining who can reply to this users posts. If value is an empty array, no one can reply. If value is undefined, anyone can reply.
	 * @maxLength 5
	 */
	get threadgateAllowRules() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						AppBskyFeedThreadgate.followerRuleSchema,
						AppBskyFeedThreadgate.followingRuleSchema,
						AppBskyFeedThreadgate.listRuleSchema,
						AppBskyFeedThreadgate.mentionRuleSchema,
					]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 5)],
			),
		);
	},
});
const _preferencesSchema = /*#__PURE__*/ v.array(() => {
	return /*#__PURE__*/ v.variant([
		adultContentPrefSchema,
		bskyAppStatePrefSchema,
		contentLabelPrefSchema,
		feedViewPrefSchema,
		hiddenPostsPrefSchema,
		interestsPrefSchema,
		labelersPrefSchema,
		mutedWordsPrefSchema,
		personalDetailsPrefSchema,
		postInteractionSettingsPrefSchema,
		savedFeedsPrefSchema,
		savedFeedsPrefV2Schema,
		threadViewPrefSchema,
		verificationPrefsSchema,
	]);
});
const _profileAssociatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileAssociated')),
	get activitySubscription() {
		return /*#__PURE__*/ v.optional(profileAssociatedActivitySubscriptionSchema);
	},
	get chat() {
		return /*#__PURE__*/ v.optional(profileAssociatedChatSchema);
	},
	feedgens: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	labeler: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	lists: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	starterPacks: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _profileAssociatedActivitySubscriptionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileAssociatedActivitySubscription'),
	),
	allowSubscriptions: /*#__PURE__*/ v.string<'followers' | 'mutuals' | 'none' | (string & {})>(),
});
const _profileAssociatedChatSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileAssociatedChat')),
	allowIncoming: /*#__PURE__*/ v.string<'all' | 'following' | 'none' | (string & {})>(),
});
const _profileViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileView')),
	get associated() {
		return /*#__PURE__*/ v.optional(profileAssociatedSchema);
	},
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * @maxLength 2560
	 * @maxGraphemes 256
	 */
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 2560),
			/*#__PURE__*/ v.stringGraphemes(0, 256),
		]),
	),
	did: /*#__PURE__*/ v.didString(),
	/**
	 * @maxLength 640
	 * @maxGraphemes 64
	 */
	displayName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 640),
			/*#__PURE__*/ v.stringGraphemes(0, 64),
		]),
	),
	handle: /*#__PURE__*/ v.handleString(),
	indexedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	pronouns: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get status() {
		return /*#__PURE__*/ v.optional(statusViewSchema);
	},
	get verification() {
		return /*#__PURE__*/ v.optional(verificationStateSchema);
	},
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
});
const _profileViewBasicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileViewBasic')),
	get associated() {
		return /*#__PURE__*/ v.optional(profileAssociatedSchema);
	},
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	did: /*#__PURE__*/ v.didString(),
	/**
	 * @maxLength 640
	 * @maxGraphemes 64
	 */
	displayName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 640),
			/*#__PURE__*/ v.stringGraphemes(0, 64),
		]),
	),
	handle: /*#__PURE__*/ v.handleString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	pronouns: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get status() {
		return /*#__PURE__*/ v.optional(statusViewSchema);
	},
	get verification() {
		return /*#__PURE__*/ v.optional(verificationStateSchema);
	},
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
});
const _profileViewDetailedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileViewDetailed')),
	get associated() {
		return /*#__PURE__*/ v.optional(profileAssociatedSchema);
	},
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	banner: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * @maxLength 2560
	 * @maxGraphemes 256
	 */
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 2560),
			/*#__PURE__*/ v.stringGraphemes(0, 256),
		]),
	),
	did: /*#__PURE__*/ v.didString(),
	/**
	 * @maxLength 640
	 * @maxGraphemes 64
	 */
	displayName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 640),
			/*#__PURE__*/ v.stringGraphemes(0, 64),
		]),
	),
	followersCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	followsCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	handle: /*#__PURE__*/ v.handleString(),
	indexedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get joinedViaStarterPack() {
		return /*#__PURE__*/ v.optional(AppBskyGraphDefs.starterPackViewBasicSchema);
	},
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	get pinnedPost() {
		return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
	},
	postsCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	pronouns: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get status() {
		return /*#__PURE__*/ v.optional(statusViewSchema);
	},
	get verification() {
		return /*#__PURE__*/ v.optional(verificationStateSchema);
	},
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
	website: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
});
const _savedFeedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#savedFeed')),
	id: /*#__PURE__*/ v.string(),
	pinned: /*#__PURE__*/ v.boolean(),
	type: /*#__PURE__*/ v.string<'feed' | 'list' | 'timeline' | (string & {})>(),
	value: /*#__PURE__*/ v.string(),
});
const _savedFeedsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#savedFeedsPref')),
	pinned: /*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()),
	saved: /*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()),
	timelineIndex: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _savedFeedsPrefV2Schema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#savedFeedsPrefV2')),
	get items() {
		return /*#__PURE__*/ v.array(savedFeedSchema);
	},
});
const _statusViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#statusView')),
	/**
	 * An optional embed associated with the status.
	 */
	get embed() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([AppBskyEmbedExternal.viewSchema]));
	},
	/**
	 * The date when this status will expire. The application might choose to no longer return the status after expiration.
	 */
	expiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * True if the status is not expired, false if it is expired. Only present if expiration was set.
	 */
	isActive: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	record: /*#__PURE__*/ v.unknown(),
	/**
	 * The status for the account.
	 */
	status: /*#__PURE__*/ v.string<'app.bsky.actor.status#live' | (string & {})>(),
});
const _threadViewPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#threadViewPref')),
	/**
	 * Show followed users at the top of all replies.
	 */
	prioritizeFollowedUsers: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * Sorting mode for threads.
	 */
	sort: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'hotness' | 'most-likes' | 'newest' | 'oldest' | 'random' | (string & {})>(),
	),
});
const _verificationPrefsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#verificationPrefs')),
	/**
	 * Hide the blue check badges for verified accounts and trusted verifiers.
	 * @default false
	 */
	hideBadges: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
});
const _verificationStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#verificationState')),
	/**
	 * The user's status as a trusted verifier.
	 */
	trustedVerifierStatus: /*#__PURE__*/ v.string<'invalid' | 'none' | 'valid' | (string & {})>(),
	/**
	 * All verifications issued by trusted verifiers on behalf of this user. Verifications by untrusted verifiers are not included.
	 */
	get verifications() {
		return /*#__PURE__*/ v.array(verificationViewSchema);
	},
	/**
	 * The user's status as a verified account.
	 */
	verifiedStatus: /*#__PURE__*/ v.string<'invalid' | 'none' | 'valid' | (string & {})>(),
});
const _verificationViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#verificationView')),
	/**
	 * Timestamp when the verification was created.
	 */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/**
	 * True if the verification passes validation, otherwise false.
	 */
	isValid: /*#__PURE__*/ v.boolean(),
	/**
	 * The user who issued this verification.
	 */
	issuer: /*#__PURE__*/ v.didString(),
	/**
	 * The AT-URI of the verification record.
	 */
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _viewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#viewerState')),
	/**
	 * This property is present only in selected cases, as an optimization.
	 */
	get activitySubscription() {
		return /*#__PURE__*/ v.optional(AppBskyNotificationDefs.activitySubscriptionSchema);
	},
	blockedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	blocking: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	get blockingByList() {
		return /*#__PURE__*/ v.optional(AppBskyGraphDefs.listViewBasicSchema);
	},
	followedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	following: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	/**
	 * This property is present only in selected cases, as an optimization.
	 */
	get knownFollowers() {
		return /*#__PURE__*/ v.optional(knownFollowersSchema);
	},
	muted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get mutedByList() {
		return /*#__PURE__*/ v.optional(AppBskyGraphDefs.listViewBasicSchema);
	},
});

type adultContentPref$schematype = typeof _adultContentPrefSchema;
type bskyAppProgressGuide$schematype = typeof _bskyAppProgressGuideSchema;
type bskyAppStatePref$schematype = typeof _bskyAppStatePrefSchema;
type contentLabelPref$schematype = typeof _contentLabelPrefSchema;
type feedViewPref$schematype = typeof _feedViewPrefSchema;
type hiddenPostsPref$schematype = typeof _hiddenPostsPrefSchema;
type interestsPref$schematype = typeof _interestsPrefSchema;
type knownFollowers$schematype = typeof _knownFollowersSchema;
type labelerPrefItem$schematype = typeof _labelerPrefItemSchema;
type labelersPref$schematype = typeof _labelersPrefSchema;
type mutedWord$schematype = typeof _mutedWordSchema;
type mutedWordTarget$schematype = typeof _mutedWordTargetSchema;
type mutedWordsPref$schematype = typeof _mutedWordsPrefSchema;
type nux$schematype = typeof _nuxSchema;
type personalDetailsPref$schematype = typeof _personalDetailsPrefSchema;
type postInteractionSettingsPref$schematype = typeof _postInteractionSettingsPrefSchema;
type preferences$schematype = typeof _preferencesSchema;
type profileAssociated$schematype = typeof _profileAssociatedSchema;
type profileAssociatedActivitySubscription$schematype = typeof _profileAssociatedActivitySubscriptionSchema;
type profileAssociatedChat$schematype = typeof _profileAssociatedChatSchema;
type profileView$schematype = typeof _profileViewSchema;
type profileViewBasic$schematype = typeof _profileViewBasicSchema;
type profileViewDetailed$schematype = typeof _profileViewDetailedSchema;
type savedFeed$schematype = typeof _savedFeedSchema;
type savedFeedsPref$schematype = typeof _savedFeedsPrefSchema;
type savedFeedsPrefV2$schematype = typeof _savedFeedsPrefV2Schema;
type statusView$schematype = typeof _statusViewSchema;
type threadViewPref$schematype = typeof _threadViewPrefSchema;
type verificationPrefs$schematype = typeof _verificationPrefsSchema;
type verificationState$schematype = typeof _verificationStateSchema;
type verificationView$schematype = typeof _verificationViewSchema;
type viewerState$schematype = typeof _viewerStateSchema;

export interface adultContentPrefSchema extends adultContentPref$schematype {}
export interface bskyAppProgressGuideSchema extends bskyAppProgressGuide$schematype {}
export interface bskyAppStatePrefSchema extends bskyAppStatePref$schematype {}
export interface contentLabelPrefSchema extends contentLabelPref$schematype {}
export interface feedViewPrefSchema extends feedViewPref$schematype {}
export interface hiddenPostsPrefSchema extends hiddenPostsPref$schematype {}
export interface interestsPrefSchema extends interestsPref$schematype {}
export interface knownFollowersSchema extends knownFollowers$schematype {}
export interface labelerPrefItemSchema extends labelerPrefItem$schematype {}
export interface labelersPrefSchema extends labelersPref$schematype {}
export interface mutedWordSchema extends mutedWord$schematype {}
export interface mutedWordTargetSchema extends mutedWordTarget$schematype {}
export interface mutedWordsPrefSchema extends mutedWordsPref$schematype {}
export interface nuxSchema extends nux$schematype {}
export interface personalDetailsPrefSchema extends personalDetailsPref$schematype {}
export interface postInteractionSettingsPrefSchema extends postInteractionSettingsPref$schematype {}
export interface preferencesSchema extends preferences$schematype {}
export interface profileAssociatedSchema extends profileAssociated$schematype {}
export interface profileAssociatedActivitySubscriptionSchema
	extends profileAssociatedActivitySubscription$schematype {}
export interface profileAssociatedChatSchema extends profileAssociatedChat$schematype {}
export interface profileViewSchema extends profileView$schematype {}
export interface profileViewBasicSchema extends profileViewBasic$schematype {}
export interface profileViewDetailedSchema extends profileViewDetailed$schematype {}
export interface savedFeedSchema extends savedFeed$schematype {}
export interface savedFeedsPrefSchema extends savedFeedsPref$schematype {}
export interface savedFeedsPrefV2Schema extends savedFeedsPrefV2$schematype {}
export interface statusViewSchema extends statusView$schematype {}
export interface threadViewPrefSchema extends threadViewPref$schematype {}
export interface verificationPrefsSchema extends verificationPrefs$schematype {}
export interface verificationStateSchema extends verificationState$schematype {}
export interface verificationViewSchema extends verificationView$schematype {}
export interface viewerStateSchema extends viewerState$schematype {}

export const adultContentPrefSchema = _adultContentPrefSchema as adultContentPrefSchema;
export const bskyAppProgressGuideSchema = _bskyAppProgressGuideSchema as bskyAppProgressGuideSchema;
export const bskyAppStatePrefSchema = _bskyAppStatePrefSchema as bskyAppStatePrefSchema;
export const contentLabelPrefSchema = _contentLabelPrefSchema as contentLabelPrefSchema;
export const feedViewPrefSchema = _feedViewPrefSchema as feedViewPrefSchema;
export const hiddenPostsPrefSchema = _hiddenPostsPrefSchema as hiddenPostsPrefSchema;
export const interestsPrefSchema = _interestsPrefSchema as interestsPrefSchema;
export const knownFollowersSchema = _knownFollowersSchema as knownFollowersSchema;
export const labelerPrefItemSchema = _labelerPrefItemSchema as labelerPrefItemSchema;
export const labelersPrefSchema = _labelersPrefSchema as labelersPrefSchema;
export const mutedWordSchema = _mutedWordSchema as mutedWordSchema;
export const mutedWordTargetSchema = _mutedWordTargetSchema as mutedWordTargetSchema;
export const mutedWordsPrefSchema = _mutedWordsPrefSchema as mutedWordsPrefSchema;
export const nuxSchema = _nuxSchema as nuxSchema;
export const personalDetailsPrefSchema = _personalDetailsPrefSchema as personalDetailsPrefSchema;
export const postInteractionSettingsPrefSchema =
	_postInteractionSettingsPrefSchema as postInteractionSettingsPrefSchema;
export const preferencesSchema = _preferencesSchema as preferencesSchema;
export const profileAssociatedSchema = _profileAssociatedSchema as profileAssociatedSchema;
export const profileAssociatedActivitySubscriptionSchema =
	_profileAssociatedActivitySubscriptionSchema as profileAssociatedActivitySubscriptionSchema;
export const profileAssociatedChatSchema = _profileAssociatedChatSchema as profileAssociatedChatSchema;
export const profileViewSchema = _profileViewSchema as profileViewSchema;
export const profileViewBasicSchema = _profileViewBasicSchema as profileViewBasicSchema;
export const profileViewDetailedSchema = _profileViewDetailedSchema as profileViewDetailedSchema;
export const savedFeedSchema = _savedFeedSchema as savedFeedSchema;
export const savedFeedsPrefSchema = _savedFeedsPrefSchema as savedFeedsPrefSchema;
export const savedFeedsPrefV2Schema = _savedFeedsPrefV2Schema as savedFeedsPrefV2Schema;
export const statusViewSchema = _statusViewSchema as statusViewSchema;
export const threadViewPrefSchema = _threadViewPrefSchema as threadViewPrefSchema;
export const verificationPrefsSchema = _verificationPrefsSchema as verificationPrefsSchema;
export const verificationStateSchema = _verificationStateSchema as verificationStateSchema;
export const verificationViewSchema = _verificationViewSchema as verificationViewSchema;
export const viewerStateSchema = _viewerStateSchema as viewerStateSchema;

export interface AdultContentPref extends v.InferInput<typeof adultContentPrefSchema> {}
export interface BskyAppProgressGuide extends v.InferInput<typeof bskyAppProgressGuideSchema> {}
export interface BskyAppStatePref extends v.InferInput<typeof bskyAppStatePrefSchema> {}
export interface ContentLabelPref extends v.InferInput<typeof contentLabelPrefSchema> {}
export interface FeedViewPref extends v.InferInput<typeof feedViewPrefSchema> {}
export interface HiddenPostsPref extends v.InferInput<typeof hiddenPostsPrefSchema> {}
export interface InterestsPref extends v.InferInput<typeof interestsPrefSchema> {}
export interface KnownFollowers extends v.InferInput<typeof knownFollowersSchema> {}
export interface LabelerPrefItem extends v.InferInput<typeof labelerPrefItemSchema> {}
export interface LabelersPref extends v.InferInput<typeof labelersPrefSchema> {}
export interface MutedWord extends v.InferInput<typeof mutedWordSchema> {}
export type MutedWordTarget = v.InferInput<typeof mutedWordTargetSchema>;
export interface MutedWordsPref extends v.InferInput<typeof mutedWordsPrefSchema> {}
export interface Nux extends v.InferInput<typeof nuxSchema> {}
export interface PersonalDetailsPref extends v.InferInput<typeof personalDetailsPrefSchema> {}
export interface PostInteractionSettingsPref extends v.InferInput<typeof postInteractionSettingsPrefSchema> {}
export interface Preferences extends v.InferInput<typeof preferencesSchema> {}
export interface ProfileAssociated extends v.InferInput<typeof profileAssociatedSchema> {}
export interface ProfileAssociatedActivitySubscription
	extends v.InferInput<typeof profileAssociatedActivitySubscriptionSchema> {}
export interface ProfileAssociatedChat extends v.InferInput<typeof profileAssociatedChatSchema> {}
export interface ProfileView extends v.InferInput<typeof profileViewSchema> {}
export interface ProfileViewBasic extends v.InferInput<typeof profileViewBasicSchema> {}
export interface ProfileViewDetailed extends v.InferInput<typeof profileViewDetailedSchema> {}
export interface SavedFeed extends v.InferInput<typeof savedFeedSchema> {}
export interface SavedFeedsPref extends v.InferInput<typeof savedFeedsPrefSchema> {}
export interface SavedFeedsPrefV2 extends v.InferInput<typeof savedFeedsPrefV2Schema> {}
export interface StatusView extends v.InferInput<typeof statusViewSchema> {}
export interface ThreadViewPref extends v.InferInput<typeof threadViewPrefSchema> {}
export interface VerificationPrefs extends v.InferInput<typeof verificationPrefsSchema> {}
export interface VerificationState extends v.InferInput<typeof verificationStateSchema> {}
export interface VerificationView extends v.InferInput<typeof verificationViewSchema> {}
export interface ViewerState extends v.InferInput<typeof viewerStateSchema> {}
