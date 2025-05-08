import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyFeedPostgate from '../feed/postgate.js';
import * as AppBskyFeedThreadgate from '../feed/threadgate.js';
import * as AppBskyGraphDefs from '../graph/defs.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';

const _adultContentPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#adultContentPref')),
	enabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
});
const _bskyAppProgressGuideSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#bskyAppProgressGuide')),
	guide: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
});
const _bskyAppStatePrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#bskyAppStatePref')),
	get activeProgressGuide() {
		return /*#__PURE__*/ v.optional(bskyAppProgressGuideSchema);
	},
	queuedNudges: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(
			v.array(/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)])),
			[/*#__PURE__*/ v.arrayLength(0, 1000)],
		),
	),
	get nuxs() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(v.array(nuxSchema), [/*#__PURE__*/ v.arrayLength(0, 100)]),
		);
	},
});
const _contentLabelPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#contentLabelPref')),
	labelerDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	label: /*#__PURE__*/ v.string(),
	visibility: /*#__PURE__*/ v.string<'ignore' | 'show' | 'warn' | 'hide' | (string & {})>(),
});
const _feedViewPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#feedViewPref')),
	feed: /*#__PURE__*/ v.string(),
	hideReplies: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	hideRepliesByUnfollowed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
	hideRepliesByLikeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	hideReposts: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	hideQuotePosts: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _hiddenPostsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#hiddenPostsPref')),
	items: /*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()),
});
const _interestsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#interestsPref')),
	tags: /*#__PURE__*/ v.constrain(
		v.array(
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
	get followers() {
		return /*#__PURE__*/ v.constrain(v.array(profileViewBasicSchema), [/*#__PURE__*/ v.arrayLength(0, 5)]);
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
	id: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	value: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 10000),
		/*#__PURE__*/ v.stringGraphemes(0, 1000),
	]),
	get targets() {
		return /*#__PURE__*/ v.array(mutedWordTargetSchema);
	},
	actorTarget: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'all' | 'exclude-following' | (string & {})>(),
		'all',
	),
	expiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _mutedWordTargetSchema = /*#__PURE__*/ v.constrain(
	/*#__PURE__*/ v.string<'content' | 'tag' | (string & {})>(),
	[/*#__PURE__*/ v.stringLength(0, 640), /*#__PURE__*/ v.stringGraphemes(0, 64)],
);
const _mutedWordsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#mutedWordsPref')),
	get items() {
		return /*#__PURE__*/ v.array(mutedWordSchema);
	},
});
const _nuxSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#nux')),
	id: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 100)]),
	completed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	data: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	),
	expiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _personalDetailsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#personalDetailsPref')),
	birthDate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _postInteractionSettingsPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#postInteractionSettingsPref')),
	get threadgateAllowRules() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				v.array(
					/*#__PURE__*/ v.variant([
						AppBskyFeedThreadgate.mentionRuleSchema,
						AppBskyFeedThreadgate.followerRuleSchema,
						AppBskyFeedThreadgate.followingRuleSchema,
						AppBskyFeedThreadgate.listRuleSchema,
					]),
				),
				[/*#__PURE__*/ v.arrayLength(0, 5)],
			),
		);
	},
	get postgateEmbeddingRules() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.variant([AppBskyFeedPostgate.disableRuleSchema])), [
				/*#__PURE__*/ v.arrayLength(0, 5),
			]),
		);
	},
});
const _preferencesSchema = /*#__PURE__*/ v.array(() => {
	return /*#__PURE__*/ v.variant([
		adultContentPrefSchema,
		contentLabelPrefSchema,
		savedFeedsPrefSchema,
		savedFeedsPrefV2Schema,
		personalDetailsPrefSchema,
		feedViewPrefSchema,
		threadViewPrefSchema,
		interestsPrefSchema,
		mutedWordsPrefSchema,
		hiddenPostsPrefSchema,
		bskyAppStatePrefSchema,
		labelersPrefSchema,
		postInteractionSettingsPrefSchema,
		verificationPrefsSchema,
	]);
});
const _profileAssociatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileAssociated')),
	lists: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	feedgens: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	starterPacks: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	labeler: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get chat() {
		return /*#__PURE__*/ v.optional(profileAssociatedChatSchema);
	},
});
const _profileAssociatedChatSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileAssociatedChat')),
	allowIncoming: /*#__PURE__*/ v.string<'all' | 'none' | 'following' | (string & {})>(),
});
const _profileViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileView')),
	did: /*#__PURE__*/ v.didString(),
	handle: /*#__PURE__*/ v.handleString(),
	displayName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 640),
			/*#__PURE__*/ v.stringGraphemes(0, 64),
		]),
	),
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 2560),
			/*#__PURE__*/ v.stringGraphemes(0, 256),
		]),
	),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	get associated() {
		return /*#__PURE__*/ v.optional(profileAssociatedSchema);
	},
	indexedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	get verification() {
		return /*#__PURE__*/ v.optional(verificationStateSchema);
	},
});
const _profileViewBasicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileViewBasic')),
	did: /*#__PURE__*/ v.didString(),
	handle: /*#__PURE__*/ v.handleString(),
	displayName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 640),
			/*#__PURE__*/ v.stringGraphemes(0, 64),
		]),
	),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	get associated() {
		return /*#__PURE__*/ v.optional(profileAssociatedSchema);
	},
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get verification() {
		return /*#__PURE__*/ v.optional(verificationStateSchema);
	},
});
const _profileViewDetailedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#profileViewDetailed')),
	did: /*#__PURE__*/ v.didString(),
	handle: /*#__PURE__*/ v.handleString(),
	displayName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 640),
			/*#__PURE__*/ v.stringGraphemes(0, 64),
		]),
	),
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 2560),
			/*#__PURE__*/ v.stringGraphemes(0, 256),
		]),
	),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	banner: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	followersCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	followsCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	postsCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get associated() {
		return /*#__PURE__*/ v.optional(profileAssociatedSchema);
	},
	get joinedViaStarterPack() {
		return /*#__PURE__*/ v.optional(AppBskyGraphDefs.starterPackViewBasicSchema);
	},
	indexedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	get pinnedPost() {
		return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
	},
	get verification() {
		return /*#__PURE__*/ v.optional(verificationStateSchema);
	},
});
const _savedFeedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#savedFeed')),
	id: /*#__PURE__*/ v.string(),
	type: /*#__PURE__*/ v.string<'feed' | 'list' | 'timeline' | (string & {})>(),
	value: /*#__PURE__*/ v.string(),
	pinned: /*#__PURE__*/ v.boolean(),
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
const _threadViewPrefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#threadViewPref')),
	sort: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'oldest' | 'newest' | 'most-likes' | 'random' | 'hotness' | (string & {})>(),
	),
	prioritizeFollowedUsers: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _verificationPrefsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#verificationPrefs')),
	hideBadges: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
});
const _verificationStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#verificationState')),
	get verifications() {
		return /*#__PURE__*/ v.array(verificationViewSchema);
	},
	verifiedStatus: /*#__PURE__*/ v.string<'valid' | 'invalid' | 'none' | (string & {})>(),
	trustedVerifierStatus: /*#__PURE__*/ v.string<'valid' | 'invalid' | 'none' | (string & {})>(),
});
const _verificationViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#verificationView')),
	issuer: /*#__PURE__*/ v.didString(),
	uri: /*#__PURE__*/ v.resourceUriString(),
	isValid: /*#__PURE__*/ v.boolean(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
});
const _viewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.actor.defs#viewerState')),
	muted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get mutedByList() {
		return /*#__PURE__*/ v.optional(AppBskyGraphDefs.listViewBasicSchema);
	},
	blockedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	blocking: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	get blockingByList() {
		return /*#__PURE__*/ v.optional(AppBskyGraphDefs.listViewBasicSchema);
	},
	following: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	followedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	get knownFollowers() {
		return /*#__PURE__*/ v.optional(knownFollowersSchema);
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
type profileAssociatedChat$schematype = typeof _profileAssociatedChatSchema;
type profileView$schematype = typeof _profileViewSchema;
type profileViewBasic$schematype = typeof _profileViewBasicSchema;
type profileViewDetailed$schematype = typeof _profileViewDetailedSchema;
type savedFeed$schematype = typeof _savedFeedSchema;
type savedFeedsPref$schematype = typeof _savedFeedsPrefSchema;
type savedFeedsPrefV2$schematype = typeof _savedFeedsPrefV2Schema;
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
export interface profileAssociatedChatSchema extends profileAssociatedChat$schematype {}
export interface profileViewSchema extends profileView$schematype {}
export interface profileViewBasicSchema extends profileViewBasic$schematype {}
export interface profileViewDetailedSchema extends profileViewDetailed$schematype {}
export interface savedFeedSchema extends savedFeed$schematype {}
export interface savedFeedsPrefSchema extends savedFeedsPref$schematype {}
export interface savedFeedsPrefV2Schema extends savedFeedsPrefV2$schematype {}
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
export const profileAssociatedChatSchema = _profileAssociatedChatSchema as profileAssociatedChatSchema;
export const profileViewSchema = _profileViewSchema as profileViewSchema;
export const profileViewBasicSchema = _profileViewBasicSchema as profileViewBasicSchema;
export const profileViewDetailedSchema = _profileViewDetailedSchema as profileViewDetailedSchema;
export const savedFeedSchema = _savedFeedSchema as savedFeedSchema;
export const savedFeedsPrefSchema = _savedFeedsPrefSchema as savedFeedsPrefSchema;
export const savedFeedsPrefV2Schema = _savedFeedsPrefV2Schema as savedFeedsPrefV2Schema;
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
export interface ProfileAssociatedChat extends v.InferInput<typeof profileAssociatedChatSchema> {}
export interface ProfileView extends v.InferInput<typeof profileViewSchema> {}
export interface ProfileViewBasic extends v.InferInput<typeof profileViewBasicSchema> {}
export interface ProfileViewDetailed extends v.InferInput<typeof profileViewDetailedSchema> {}
export interface SavedFeed extends v.InferInput<typeof savedFeedSchema> {}
export interface SavedFeedsPref extends v.InferInput<typeof savedFeedsPrefSchema> {}
export interface SavedFeedsPrefV2 extends v.InferInput<typeof savedFeedsPrefV2Schema> {}
export interface ThreadViewPref extends v.InferInput<typeof threadViewPrefSchema> {}
export interface VerificationPrefs extends v.InferInput<typeof verificationPrefsSchema> {}
export interface VerificationState extends v.InferInput<typeof verificationStateSchema> {}
export interface VerificationView extends v.InferInput<typeof verificationViewSchema> {}
export interface ViewerState extends v.InferInput<typeof viewerStateSchema> {}
