import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledGitRefUpdate from '../git/refUpdate.ts';

const _gitSync1Schema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.knot.subscribeRepos#gitSync1')),
	/**
	 * Repository DID identifier
	 */
	did: /*#__PURE__*/ v.didString(),
	/**
	 * The stream sequence number of this message.
	 */
	seq: /*#__PURE__*/ v.integer(),
});
const _gitSync2Schema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.knot.subscribeRepos#gitSync2')),
	/**
	 * Repository AT-URI identifier
	 */
	repo: /*#__PURE__*/ v.resourceUriString(),
	/**
	 * The stream sequence number of this message.
	 */
	seq: /*#__PURE__*/ v.integer(),
});
const _identitySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.knot.subscribeRepos#identity')),
	/**
	 * Repository DID identifier
	 */
	did: /*#__PURE__*/ v.didString(),
	/**
	 * The stream sequence number of this message.
	 */
	seq: /*#__PURE__*/ v.integer(),
	time: /*#__PURE__*/ v.datetimeString(),
});
const _mainSchema = /*#__PURE__*/ v.subscription('sh.tangled.knot.subscribeRepos', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The last known event seq number to backfill from.
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([ShTangledGitRefUpdate.mainSchema, identitySchema]);
	},
});

type gitSync1$schematype = typeof _gitSync1Schema;
type gitSync2$schematype = typeof _gitSync2Schema;
type identity$schematype = typeof _identitySchema;
type main$schematype = typeof _mainSchema;

export interface gitSync1Schema extends gitSync1$schematype {}
export interface gitSync2Schema extends gitSync2$schematype {}
export interface identitySchema extends identity$schematype {}
export interface mainSchema extends main$schematype {}

export const gitSync1Schema = _gitSync1Schema as gitSync1Schema;
export const gitSync2Schema = _gitSync2Schema as gitSync2Schema;
export const identitySchema = _identitySchema as identitySchema;
export const mainSchema = _mainSchema as mainSchema;

export interface GitSync1 extends v.InferInput<typeof gitSync1Schema> {}
export interface GitSync2 extends v.InferInput<typeof gitSync2Schema> {}
export interface Identity extends v.InferInput<typeof identitySchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $message = v.InferInput<mainSchema['message']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'sh.tangled.knot.subscribeRepos': mainSchema;
	}
}
