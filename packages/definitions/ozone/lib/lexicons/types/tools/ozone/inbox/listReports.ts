import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import * as ChatBskyConvoDefs from '@atcute/bluesky/types/chat/convo/defs';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.inbox.listReports', {
	params: /*#__PURE__*/ v.object({
		/** An opaque cursor for pagination. */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Account to preview. Defaults to the authenticated account; another account requires an active
		 * moderator, triage, or admin credential.
		 */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * Filter report activity. unread includes reports whose updatedAt is after the reports section's seenAt
		 * watermark.
		 *
		 * @default 'all'
		 */
		filter: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.literalEnum(['all', 'pending', 'resolved', 'unread']),
			'all',
		),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** @default 'desc' */
		sortDirection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['asc', 'desc']), 'desc'),
		/** @default 'updatedAt' */
		sortField: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['createdAt', 'updatedAt']), 'updatedAt'),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get reports() {
				return /*#__PURE__*/ v.array(reportViewSchema);
			},
		}),
	},
});
const _reportViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.listReports#reportView')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Report ID (report table ID), used by getReport and Ozone's report detail page. */
	id: /*#__PURE__*/ v.integer(),
	isRead: /*#__PURE__*/ v.boolean(),
	/**
	 * Public action associated with this report's transition to resolved. See the public action vocabulary
	 * table.
	 */
	lastActionTaken: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * @maxLength 20000
	 * @maxGraphemes 2000
	 */
	reason: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 20000),
			/*#__PURE__*/ v.stringGraphemes(0, 2000),
		]),
	),
	/** The exact fully-qualified reason NSID submitted with and stored on the report. */
	reasonType: /*#__PURE__*/ v.string(),
	scope: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'app' | 'labelOnly' | 'network' | (string & {})>()),
	/** DID of the moderation service that received the report. */
	src: /*#__PURE__*/ v.didString(),
	status: /*#__PURE__*/ v.string<'pending' | 'resolved' | (string & {})>(),
	get subject() {
		return /*#__PURE__*/ v.variant([
			ChatBskyConvoDefs.convoRefSchema,
			ChatBskyConvoDefs.messageRefSchema,
			ComAtprotoAdminDefs.repoRefSchema,
			ComAtprotoRepoStrongRef.mainSchema,
		]);
	},
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});

type main$schematype = typeof _mainSchema;
type reportView$schematype = typeof _reportViewSchema;

export interface mainSchema extends main$schematype {}
export interface reportViewSchema extends reportView$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const reportViewSchema = _reportViewSchema as reportViewSchema;

export interface ReportView extends v.InferInput<typeof reportViewSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.inbox.listReports': mainSchema;
	}
}
