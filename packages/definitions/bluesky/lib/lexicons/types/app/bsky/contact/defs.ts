import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyActorDefs from '../actor/defs.ts';

const _matchAndContactIndexSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.contact.defs#matchAndContactIndex')),
	/**
	 * The index of this match in the import contact input.
	 * @minimum 0
	 * @maximum 999
	 */
	contactIndex: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(0, 999)]),
	/**
	 * Profile of the matched user.
	 */
	get match() {
		return AppBskyActorDefs.profileViewSchema;
	},
});
const _notificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.contact.defs#notification')),
	/**
	 * The DID of who this notification comes from.
	 */
	from: /*#__PURE__*/ v.didString(),
	/**
	 * The DID of who this notification should go to.
	 */
	to: /*#__PURE__*/ v.didString(),
});
const _syncStatusSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.contact.defs#syncStatus')),
	/**
	 * Number of existing contact matches resulting of the user imports and of their imported contacts having imported the user. Matches stop being counted when the user either follows the matched contact or dismisses the match.
	 * @minimum 0
	 */
	matchesCount: /*#__PURE__*/ v.integer(),
	/**
	 * Last date when contacts where imported.
	 */
	syncedAt: /*#__PURE__*/ v.datetimeString(),
});

type matchAndContactIndex$schematype = typeof _matchAndContactIndexSchema;
type notification$schematype = typeof _notificationSchema;
type syncStatus$schematype = typeof _syncStatusSchema;

export interface matchAndContactIndexSchema extends matchAndContactIndex$schematype {}
export interface notificationSchema extends notification$schematype {}
export interface syncStatusSchema extends syncStatus$schematype {}

export const matchAndContactIndexSchema = _matchAndContactIndexSchema as matchAndContactIndexSchema;
export const notificationSchema = _notificationSchema as notificationSchema;
export const syncStatusSchema = _syncStatusSchema as syncStatusSchema;

export interface MatchAndContactIndex extends v.InferInput<typeof matchAndContactIndexSchema> {}
export interface Notification extends v.InferInput<typeof notificationSchema> {}
export interface SyncStatus extends v.InferInput<typeof syncStatusSchema> {}
