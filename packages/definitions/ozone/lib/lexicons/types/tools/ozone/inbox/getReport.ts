import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import * as ChatBskyConvoDefs from '@atcute/bluesky/types/chat/convo/defs';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.inbox.getReport', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Reporter to preview. Defaults to the authenticated account; another account requires an active
		 * moderator, triage, or admin credential.
		 */
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/** Report ID (report table ID), as returned by listReports. */
		id: /*#__PURE__*/ v.integer(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get report() {
				return reportViewSchema;
			},
			/** Present only when the report is resolved. */
			get resolution() {
				return /*#__PURE__*/ v.optional(resolutionViewSchema);
			},
		}),
	},
});
const _reportViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.getReport#reportView')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Report ID (report table ID), used by Ozone's report detail page. */
	id: /*#__PURE__*/ v.integer(),
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
	/** Raw record JSON for the subject, when the subject is a record and the record is available. */
	record: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
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
const _resolutionViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.inbox.getReport#resolutionView')),
	/** Public action associated with this report's resolution. See the public action vocabulary table. */
	actionTaken: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	outcome: /*#__PURE__*/ v.string<'actionTaken' | 'noAction' | 'other' | (string & {})>(),
	resolvedAt: /*#__PURE__*/ v.datetimeString(),
	scope: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'app' | 'labelOnly' | 'network' | (string & {})>()),
});

type main$schematype = typeof _mainSchema;
type reportView$schematype = typeof _reportViewSchema;
type resolutionView$schematype = typeof _resolutionViewSchema;

export interface mainSchema extends main$schematype {}
export interface reportViewSchema extends reportView$schematype {}
export interface resolutionViewSchema extends resolutionView$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const reportViewSchema = _reportViewSchema as reportViewSchema;
export const resolutionViewSchema = _resolutionViewSchema as resolutionViewSchema;

export interface ReportView extends v.InferInput<typeof reportViewSchema> {}
export interface ResolutionView extends v.InferInput<typeof resolutionViewSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.inbox.getReport': mainSchema;
	}
}
