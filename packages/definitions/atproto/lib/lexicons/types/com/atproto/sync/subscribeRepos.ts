import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcSubscription('com.atproto.sync.subscribeRepos', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([commitSchema, syncSchema, identitySchema, accountSchema, infoSchema]);
	},
});
const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#commit')),
	seq: /*#__PURE__*/ v.integer(),
	rebase: /*#__PURE__*/ v.boolean(),
	tooBig: /*#__PURE__*/ v.boolean(),
	repo: /*#__PURE__*/ v.didString(),
	commit: /*#__PURE__*/ v.cidLink(),
	rev: /*#__PURE__*/ v.tidString(),
	since: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.tidString()),
	blocks: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.bytes(), [/*#__PURE__*/ v.bytesSize(0, 2000000)]),
	get ops() {
		return /*#__PURE__*/ v.constrain(v.array(repoOpSchema), [/*#__PURE__*/ v.arrayLength(0, 200)]);
	},
	blobs: /*#__PURE__*/ v.array(/*#__PURE__*/ v.cidLink()),
	prevData: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidLink()),
	time: /*#__PURE__*/ v.datetimeString(),
});
const _syncSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#sync')),
	seq: /*#__PURE__*/ v.integer(),
	did: /*#__PURE__*/ v.didString(),
	blocks: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.bytes(), [/*#__PURE__*/ v.bytesSize(0, 10000)]),
	rev: /*#__PURE__*/ v.string(),
	time: /*#__PURE__*/ v.datetimeString(),
});
const _identitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#identity')),
	seq: /*#__PURE__*/ v.integer(),
	did: /*#__PURE__*/ v.didString(),
	time: /*#__PURE__*/ v.datetimeString(),
	handle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.handleString()),
});
const _accountSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#account')),
	seq: /*#__PURE__*/ v.integer(),
	did: /*#__PURE__*/ v.didString(),
	time: /*#__PURE__*/ v.datetimeString(),
	active: /*#__PURE__*/ v.boolean(),
	status: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			'takendown' | 'suspended' | 'deleted' | 'deactivated' | 'desynchronized' | 'throttled' | (string & {})
		>(),
	),
});
const _infoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#info')),
	name: /*#__PURE__*/ v.string<'OutdatedCursor' | (string & {})>(),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _repoOpSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#repoOp')),
	action: /*#__PURE__*/ v.string<'create' | 'update' | 'delete' | (string & {})>(),
	path: /*#__PURE__*/ v.string(),
	cid: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.cidLink()),
	prev: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidLink()),
});

type main$schematype = typeof _mainSchema;
type commit$schematype = typeof _commitSchema;
type sync$schematype = typeof _syncSchema;
type identity$schematype = typeof _identitySchema;
type account$schematype = typeof _accountSchema;
type info$schematype = typeof _infoSchema;
type repoOp$schematype = typeof _repoOpSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}
/** @deprecated */
export interface commit$schema extends commit$schematype {}
/** @deprecated */
export interface sync$schema extends sync$schematype {}
/** @deprecated */
export interface identity$schema extends identity$schematype {}
/** @deprecated */
export interface account$schema extends account$schematype {}
/** @deprecated */
export interface info$schema extends info$schematype {}
/** @deprecated */
export interface repoOp$schema extends repoOp$schematype {}

export const mainSchema = _mainSchema as main$schema;
export const commitSchema = _commitSchema as commit$schema;
export const syncSchema = _syncSchema as sync$schema;
export const identitySchema = _identitySchema as identity$schema;
export const accountSchema = _accountSchema as account$schema;
export const infoSchema = _infoSchema as info$schema;
export const repoOpSchema = _repoOpSchema as repoOp$schema;

export interface Commit extends v.InferInput<typeof commitSchema> {}
export interface Sync extends v.InferInput<typeof syncSchema> {}
export interface Identity extends v.InferInput<typeof identitySchema> {}
export interface Account extends v.InferInput<typeof accountSchema> {}
export interface Info extends v.InferInput<typeof infoSchema> {}
export interface RepoOp extends v.InferInput<typeof repoOpSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'com.atproto.sync.subscribeRepos': main$schema;
	}
}
