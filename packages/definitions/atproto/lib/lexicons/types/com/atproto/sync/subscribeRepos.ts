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
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#commit')),
	seq: /*#__PURE__*/ v.integer(),
	rebase: /*#__PURE__*/ v.boolean(),
	tooBig: /*#__PURE__*/ v.boolean(),
	repo: /*#__PURE__*/ v.didString(),
	commit: /*#__PURE__*/ v.cidLink(),
	rev: /*#__PURE__*/ v.tidString(),
	since: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.tidString()),
	blocks: /*#__PURE__*/ v.pipe(/*#__PURE__*/ v.bytes(), /*#__PURE__*/ v.bytesSize(0, 2000000)),
	get ops() {
		return /*#__PURE__*/ v.pipe(v.array(repoOpSchema), /*#__PURE__*/ v.arrayLength(0, 200));
	},
	blobs: /*#__PURE__*/ v.array(/*#__PURE__*/ v.cidLink()),
	prevData: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidLink()),
	time: /*#__PURE__*/ v.datetimeString(),
});
export const commitSchema = _commitSchema as commitSchema.$schema;
export interface Commit extends v.InferInput<typeof commitSchema> {}
export declare namespace commitSchema {
	export {};
	type $schematype = typeof _commitSchema;
	export interface $schema extends $schematype {}
}

const _syncSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#sync')),
	seq: /*#__PURE__*/ v.integer(),
	did: /*#__PURE__*/ v.didString(),
	blocks: /*#__PURE__*/ v.pipe(/*#__PURE__*/ v.bytes(), /*#__PURE__*/ v.bytesSize(0, 10000)),
	rev: /*#__PURE__*/ v.string(),
	time: /*#__PURE__*/ v.datetimeString(),
});
export const syncSchema = _syncSchema as syncSchema.$schema;
export interface Sync extends v.InferInput<typeof syncSchema> {}
export declare namespace syncSchema {
	export {};
	type $schematype = typeof _syncSchema;
	export interface $schema extends $schematype {}
}

const _identitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#identity')),
	seq: /*#__PURE__*/ v.integer(),
	did: /*#__PURE__*/ v.didString(),
	time: /*#__PURE__*/ v.datetimeString(),
	handle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.handleString()),
});
export const identitySchema = _identitySchema as identitySchema.$schema;
export interface Identity extends v.InferInput<typeof identitySchema> {}
export declare namespace identitySchema {
	export {};
	type $schematype = typeof _identitySchema;
	export interface $schema extends $schematype {}
}

const _accountSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#account')),
	seq: /*#__PURE__*/ v.integer(),
	did: /*#__PURE__*/ v.didString(),
	time: /*#__PURE__*/ v.datetimeString(),
	active: /*#__PURE__*/ v.boolean(),
	status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
export const accountSchema = _accountSchema as accountSchema.$schema;
export interface Account extends v.InferInput<typeof accountSchema> {}
export declare namespace accountSchema {
	export {};
	type $schematype = typeof _accountSchema;
	export interface $schema extends $schematype {}
}

const _infoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#info')),
	name: /*#__PURE__*/ v.string(),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
export const infoSchema = _infoSchema as infoSchema.$schema;
export interface Info extends v.InferInput<typeof infoSchema> {}
export declare namespace infoSchema {
	export {};
	type $schematype = typeof _infoSchema;
	export interface $schema extends $schematype {}
}

const _repoOpSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.subscribeRepos#repoOp')),
	action: /*#__PURE__*/ v.string(),
	path: /*#__PURE__*/ v.string(),
	cid: /*#__PURE__*/ v.nullable(/*#__PURE__*/ v.cidLink()),
	prev: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidLink()),
});
export const repoOpSchema = _repoOpSchema as repoOpSchema.$schema;
export interface RepoOp extends v.InferInput<typeof repoOpSchema> {}
export declare namespace repoOpSchema {
	export {};
	type $schematype = typeof _repoOpSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'com.atproto.sync.subscribeRepos': mainSchema.$schema;
	}
}
