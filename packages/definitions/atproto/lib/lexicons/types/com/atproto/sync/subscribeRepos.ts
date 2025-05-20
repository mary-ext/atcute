import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _accountSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#account')),
	active: /*#__PURE__*/ v.boolean(),
	did: /*#__PURE__*/ v.didString(),
	seq: /*#__PURE__*/ v.integer(),
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
	blocks: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.bytes(), [/*#__PURE__*/ v.bytesSize(0, 2000000)]),
	commit: /*#__PURE__*/ v.cidLink(),
	get ops() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(repoOpSchema), [
			/*#__PURE__*/ v.arrayLength(0, 200),
		]);
	},
	prevData: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidLink()),
	rebase: /*#__PURE__*/ v.boolean(),
	repo: /*#__PURE__*/ v.didString(),
	rev: /*#__PURE__*/ v.tidString(),
	seq: /*#__PURE__*/ v.integer(),
	since: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.tidString()),
	time: /*#__PURE__*/ v.datetimeString(),
	tooBig: /*#__PURE__*/ v.boolean(),
});
const _identitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#identity')),
	did: /*#__PURE__*/ v.didString(),
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
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([accountSchema, commitSchema, identitySchema, infoSchema, syncSchema]);
	},
});
const _repoOpSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#repoOp')),
	action: /*#__PURE__*/ v.string<'create' | 'delete' | 'update' | (string & {})>(),
	cid: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.cidLink()),
	path: /*#__PURE__*/ v.string(),
	prev: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidLink()),
});
const _syncSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#sync')),
	blocks: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.bytes(), [/*#__PURE__*/ v.bytesSize(0, 10000)]),
	did: /*#__PURE__*/ v.didString(),
	rev: /*#__PURE__*/ v.string(),
	seq: /*#__PURE__*/ v.integer(),
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

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'com.atproto.sync.subscribeRepos': mainSchema;
	}
}
