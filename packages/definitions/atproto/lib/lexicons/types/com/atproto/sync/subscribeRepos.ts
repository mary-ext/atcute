import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _accountSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#account')),
	/**
	 * Indicates that the account has a repository which can be fetched from the host that emitted this event.
	 */
	active: /*#__PURE__*/ v.boolean(),
	did: /*#__PURE__*/ v.didString(),
	seq: /*#__PURE__*/ v.integer(),
	/**
	 * If active=false, this optional field indicates a reason for why the account is not active.
	 */
	status: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			'deactivated' | 'deleted' | 'desynchronized' | 'suspended' | 'takendown' | 'throttled' | (string & {})
		>(),
	),
	time: /*#__PURE__*/ v.datetimeString(),
});
const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#commit')),
	blobs: /*#__PURE__*/ v.array(/*#__PURE__*/ v.cidLink()),
	/**
	 * CAR file containing relevant blocks, as a diff since the previous repo state. The commit must be included as a block, and the commit block CID must be the first entry in the CAR header 'roots' list.
	 * @maxLength 2000000
	 */
	blocks: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.bytes(), [/*#__PURE__*/ v.bytesSize(0, 2000000)]),
	/**
	 * Repo commit object CID.
	 */
	commit: /*#__PURE__*/ v.cidLink(),
	/**
	 * @maxLength 200
	 */
	get ops() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(repoOpSchema), [
			/*#__PURE__*/ v.arrayLength(0, 200),
		]);
	},
	/**
	 * The root CID of the MST tree for the previous commit from this repo (indicated by the 'since' revision field in this message). Corresponds to the 'data' field in the repo commit object. NOTE: this field is effectively required for the 'inductive' version of firehose.
	 */
	prevData: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidLink()),
	/**
	 * DEPRECATED -- unused
	 */
	rebase: /*#__PURE__*/ v.boolean(),
	/**
	 * The repo this event comes from. Note that all other message types name this field 'did'.
	 */
	repo: /*#__PURE__*/ v.didString(),
	/**
	 * The rev of the emitted commit. Note that this information is also in the commit object included in blocks, unless this is a tooBig event.
	 */
	rev: /*#__PURE__*/ v.tidString(),
	/**
	 * The stream sequence number of this message.
	 */
	seq: /*#__PURE__*/ v.integer(),
	/**
	 * The rev of the last emitted commit from this repo (if any).
	 */
	since: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.tidString()),
	/**
	 * Timestamp of when this message was originally broadcast.
	 */
	time: /*#__PURE__*/ v.datetimeString(),
	/**
	 * DEPRECATED -- replaced by #sync event and data limits. Indicates that this commit contained too many ops, or data size was too large. Consumers will need to make a separate request to get missing data.
	 */
	tooBig: /*#__PURE__*/ v.boolean(),
});
const _identitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#identity')),
	did: /*#__PURE__*/ v.didString(),
	/**
	 * The current handle for the account, or 'handle.invalid' if validation fails. This field is optional, might have been validated or passed-through from an upstream source. Semantics and behaviors for PDS vs Relay may evolve in the future; see atproto specs for more details.
	 */
	handle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.handleString()),
	seq: /*#__PURE__*/ v.integer(),
	time: /*#__PURE__*/ v.datetimeString(),
});
const _infoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#info')),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	name: /*#__PURE__*/ v.string<'OutdatedCursor' | (string & {})>(),
});
const _mainSchema = /*#__PURE__*/ v.subscription('com.atproto.sync.subscribeRepos', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The last known event seq number to backfill from.
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([accountSchema, commitSchema, identitySchema, infoSchema, syncSchema]);
	},
});
const _repoOpSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#repoOp')),
	action: /*#__PURE__*/ v.string<'create' | 'delete' | 'update' | (string & {})>(),
	/**
	 * For creates and updates, the new record CID. For deletions, null.
	 */
	cid: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.cidLink()),
	path: /*#__PURE__*/ v.string(),
	/**
	 * For updates and deletes, the previous record CID (required for inductive firehose). For creations, field should not be defined.
	 */
	prev: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidLink()),
});
const _syncSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#sync')),
	/**
	 * CAR file containing the commit, as a block. The CAR header must include the commit block CID as the first 'root'.
	 * @maxLength 10000
	 */
	blocks: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.bytes(), [/*#__PURE__*/ v.bytesSize(0, 10000)]),
	/**
	 * The account this repo event corresponds to. Must match that in the commit object.
	 */
	did: /*#__PURE__*/ v.didString(),
	/**
	 * The rev of the commit. This value must match that in the commit object.
	 */
	rev: /*#__PURE__*/ v.string(),
	/**
	 * The stream sequence number of this message.
	 */
	seq: /*#__PURE__*/ v.integer(),
	/**
	 * Timestamp of when this message was originally broadcast.
	 */
	time: /*#__PURE__*/ v.datetimeString(),
});

type account$schematype = typeof _accountSchema;
type commit$schematype = typeof _commitSchema;
type identity$schematype = typeof _identitySchema;
type info$schematype = typeof _infoSchema;
type main$schematype = typeof _mainSchema;
type repoOp$schematype = typeof _repoOpSchema;
type sync$schematype = typeof _syncSchema;

export interface accountSchema extends account$schematype {}
export interface commitSchema extends commit$schematype {}
export interface identitySchema extends identity$schematype {}
export interface infoSchema extends info$schematype {}
export interface mainSchema extends main$schematype {}
export interface repoOpSchema extends repoOp$schematype {}
export interface syncSchema extends sync$schematype {}

export const accountSchema = _accountSchema as accountSchema;
export const commitSchema = _commitSchema as commitSchema;
export const identitySchema = _identitySchema as identitySchema;
export const infoSchema = _infoSchema as infoSchema;
export const mainSchema = _mainSchema as mainSchema;
export const repoOpSchema = _repoOpSchema as repoOpSchema;
export const syncSchema = _syncSchema as syncSchema;

export interface Account extends v.InferInput<typeof accountSchema> {}
export interface Commit extends v.InferInput<typeof commitSchema> {}
export interface Identity extends v.InferInput<typeof identitySchema> {}
export interface Info extends v.InferInput<typeof infoSchema> {}
export interface RepoOp extends v.InferInput<typeof repoOpSchema> {}
export interface Sync extends v.InferInput<typeof syncSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $message = v.InferInput<mainSchema['message']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'com.atproto.sync.subscribeRepos': mainSchema;
	}
}
