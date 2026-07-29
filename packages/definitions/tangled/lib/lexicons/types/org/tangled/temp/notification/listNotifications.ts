import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.notification.listNotifications', {
	params: /*#__PURE__*/ v.object({
		/** Filter by category: 'all', 'social', or 'work'. */
		category: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Max notifications per category to return.
		 *
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
		),
		/** Filter by read state: 'all' or 'unread'. */
		read: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get notifications() {
				return /*#__PURE__*/ v.array(notificationSchema);
			},
			socialUnreadCount: /*#__PURE__*/ v.integer(),
			workUnreadCount: /*#__PURE__*/ v.integer(),
		}),
	},
});
const _notificationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.temp.notification.listNotifications#notification'),
	),
	/** DID of the user who triggered this notification. */
	actorDid: /*#__PURE__*/ v.didString(),
	/** Broad category: 'social' or 'work'. */
	category: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Stable numeric ID for this notification. */
	id: /*#__PURE__*/ v.integer(),
	/** AT-URI of the related org.tangled.issue.issue record, if applicable. */
	issueAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	/** AT-URI of the related org.tangled.pulls.pull record, if applicable. */
	pullAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	read: /*#__PURE__*/ v.boolean(),
	/** DID of the related repository, if applicable. */
	repoDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	/**
	 * Notification type: repo_starred, issue_created, issue_commented, issue_closed, issue_reopen,
	 * issue_assigned, issue_unassigned, pull_created, pull_commented, pull_merged, pull_closed, pull_reopen,
	 * pull_assigned, pull_unassigned, followed, user_mentioned.
	 */
	type: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;
type notification$schematype = typeof _notificationSchema;

export interface mainSchema extends main$schematype {}
export interface notificationSchema extends notification$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const notificationSchema = _notificationSchema as notificationSchema;

export interface Notification extends v.InferInput<typeof notificationSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.notification.listNotifications': mainSchema;
	}
}
