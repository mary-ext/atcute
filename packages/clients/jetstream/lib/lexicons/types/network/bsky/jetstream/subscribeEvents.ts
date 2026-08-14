import * as ComAtprotoSyncSubscribeRepos from '@atcute/atproto/types/sync/subscribeRepos';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _accountSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('network.bsky.jetstream.subscribeEvents#account')),
	/** The upstream event; its seq and time are the upstream relay's, not Jetstream's. */
	get account() {
		return ComAtprotoSyncSubscribeRepos.accountSchema;
	},
	did: /*#__PURE__*/ v.didString(),
	seq: /*#__PURE__*/ v.integer(),
	/**
	 * The time Jetstream witnessed this event, microsecond precision. Timestamp imports apply only to record
	 * (commit) events, so this is always the witnessed time.
	 */
	time: /*#__PURE__*/ v.datetimeString(),
});
const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('network.bsky.jetstream.subscribeEvents#commit')),
	/** CID of the record. Absent for deletes. */
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	/** Collection NSID of the record. */
	collection: /*#__PURE__*/ v.nsidString(),
	did: /*#__PURE__*/ v.didString(),
	operation: /*#__PURE__*/ v.string<'create' | 'delete' | 'update' | (string & {})>(),
	/** The record decoded to JSON. Absent for deletes. */
	record: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
	/** The repo rev of the commit that produced this op. */
	rev: /*#__PURE__*/ v.tidString(),
	/** Record key. */
	rkey: /*#__PURE__*/ v.recordKeyString(),
	/** Jetstream's monotonic per-event sequence number; the stream cursor. */
	seq: /*#__PURE__*/ v.integer(),
	/**
	 * The event's display timestamp, microsecond precision: when Jetstream witnessed the event, unless an
	 * operator timestamp import overrode it. Timestamp cursors translate against the witnessed time, so after
	 * an import this value may not be a faithful resume position.
	 */
	time: /*#__PURE__*/ v.datetimeString(),
});
const _identitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('network.bsky.jetstream.subscribeEvents#identity')),
	did: /*#__PURE__*/ v.didString(),
	/** The upstream event; its seq and time are the upstream relay's, not Jetstream's. */
	get identity() {
		return ComAtprotoSyncSubscribeRepos.identitySchema;
	},
	seq: /*#__PURE__*/ v.integer(),
	/**
	 * The time Jetstream witnessed this event, microsecond precision. Timestamp imports apply only to record
	 * (commit) events, so this is always the witnessed time.
	 */
	time: /*#__PURE__*/ v.datetimeString(),
});
const _infoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('network.bsky.jetstream.subscribeEvents#info')),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	name: /*#__PURE__*/ v.string<'OutdatedCursor' | (string & {})>(),
});
const _mainSchema = /*#__PURE__*/ v.subscription('network.bsky.jetstream.subscribeEvents', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Collection NSIDs or '<prefix>.*' patterns; constrains which commit events are delivered. Non-commit
		 * kinds are unaffected — combine with kinds=commit for a commits-only collection stream. Rejected
		 * pre-upgrade with HTTP 400 (InvalidRequest) when kinds is set and excludes commit, since the filter
		 * could never apply. Omitted or empty: all collections.
		 *
		 * @maxLength 100
		 */
		collections: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
				/*#__PURE__*/ v.arrayLength(0, 100),
			]),
		),
		/**
		 * Resume position, inclusive: the server replays events with seq >= cursor and the client dedups the
		 * overlap. Values >= 1e15 are interpreted as a unix-microseconds timestamp instead of a seq and
		 * translated to the first seq witnessed at or after that instant; a timestamp below the retention floor
		 * clamps up to the floor and an #info OutdatedCursor frame is sent. Omitted: start at the live tip.
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		/**
		 * Repo DIDs to receive events for; applies to every event kind. Omitted or empty: all repos.
		 *
		 * @maxLength 10000
		 */
		dids: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
				/*#__PURE__*/ v.arrayLength(0, 10000),
			]),
		),
		/**
		 * Event kinds to receive; values are the message $type fragment names. Omitted or empty: all kinds. A
		 * value outside the enum is rejected pre-upgrade with HTTP 400 (InvalidRequest) rather than silently
		 * never matching.
		 *
		 * @maxLength 4
		 */
		kinds: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.literalEnum(['account', 'commit', 'identity', 'sync'])),
				[/*#__PURE__*/ v.arrayLength(0, 4)],
			),
		),
		/**
		 * Skip events whose uncompressed frame (envelope included) exceeds this many bytes. 0 (default) means no
		 * limit.
		 *
		 * @default 0
		 * @minimum 0
		 * @maximum 4294967295
		 */
		maxMessageSizeBytes: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 4294967295)]),
			0,
		),
		/**
		 * Jetstream extension: opt into dict-zstd frame compression with the given zstd dictionary ID (obtained
		 * via network.bsky.jetstream.getZstdDictionary). Frames then arrive as binary websocket messages, each
		 * one zstd frame whose decompressed bytes are exactly the xrpc.v1.json text frame. An unknown or retired
		 * ID is rejected pre-upgrade with HTTP 400 carrying the current ID.
		 *
		 * @minimum 1
		 */
		zstdDictionary: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
		),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([accountSchema, commitSchema, identitySchema, infoSchema, syncSchema]);
	},
	subprotocol: 'xrpc.v1.json',
});
const _syncSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('network.bsky.jetstream.subscribeEvents#sync')),
	did: /*#__PURE__*/ v.didString(),
	seq: /*#__PURE__*/ v.integer(),
	/** The upstream event; its seq and time are the upstream relay's, not Jetstream's. */
	get sync() {
		return ComAtprotoSyncSubscribeRepos.syncSchema;
	},
	/**
	 * The time Jetstream witnessed this event, microsecond precision. Timestamp imports apply only to record
	 * (commit) events, so this is always the witnessed time.
	 */
	time: /*#__PURE__*/ v.datetimeString(),
});

type account$schematype = typeof _accountSchema;
type commit$schematype = typeof _commitSchema;
type identity$schematype = typeof _identitySchema;
type info$schematype = typeof _infoSchema;
type main$schematype = typeof _mainSchema;
type sync$schematype = typeof _syncSchema;

export interface accountSchema extends account$schematype {}
export interface commitSchema extends commit$schematype {}
export interface identitySchema extends identity$schematype {}
export interface infoSchema extends info$schematype {}
export interface mainSchema extends main$schematype {}
export interface syncSchema extends sync$schematype {}

export const accountSchema = _accountSchema as accountSchema;
export const commitSchema = _commitSchema as commitSchema;
export const identitySchema = _identitySchema as identitySchema;
export const infoSchema = _infoSchema as infoSchema;
export const mainSchema = _mainSchema as mainSchema;
export const syncSchema = _syncSchema as syncSchema;

export interface Account extends v.InferInput<typeof accountSchema> {}
export interface Commit extends v.InferInput<typeof commitSchema> {}
export interface Identity extends v.InferInput<typeof identitySchema> {}
export interface Info extends v.InferInput<typeof infoSchema> {}
export interface Sync extends v.InferInput<typeof syncSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $message = v.InferInput<mainSchema['message']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'network.bsky.jetstream.subscribeEvents': mainSchema;
	}
}
