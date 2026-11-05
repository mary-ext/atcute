import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledActorDefs from '../actor/defs.ts';
import * as OrgTangledLabelDefs from '../label/defs.ts';
import * as OrgTangledMarkupMarkdown from '../markup/markdown.ts';
import * as OrgTangledRepoDefs from '../repo/defs.ts';

const _ticketStateSchema = /*#__PURE__*/ v.literalEnum(['closed', 'completed', 'open']);
const _ticketViewDetailedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.track.defs#ticketViewDetailed')),
	assignees: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
	/**
	 * The account that opened the ticket, the editor of its first version. Not the account that last edited or
	 * closed it.
	 */
	get author() {
		return OrgTangledActorDefs.profileViewBasicSchema;
	},
	get body() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([OrgTangledMarkupMarkdown.mainSchema]));
	},
	cid: /*#__PURE__*/ v.cidString(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get repo() {
		return OrgTangledRepoDefs.repoViewBasicSchema;
	},
	get state() {
		return ticketStateSchema;
	},
	get tangledLabels() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([OrgTangledLabelDefs.labelTokenSchema])),
		);
	},
	/** Present when the ticket is a pull request. */
	targetBranch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get title() {
		return /*#__PURE__*/ v.variant([OrgTangledMarkupMarkdown.inlineSchema]);
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type ticketState$schematype = typeof _ticketStateSchema;
type ticketViewDetailed$schematype = typeof _ticketViewDetailedSchema;

export interface ticketStateSchema extends ticketState$schematype {}
export interface ticketViewDetailedSchema extends ticketViewDetailed$schematype {}

export const ticketStateSchema = _ticketStateSchema as ticketStateSchema;
export const ticketViewDetailedSchema = _ticketViewDetailedSchema as ticketViewDetailedSchema;

export type TicketState = v.InferInput<typeof ticketStateSchema>;
export interface TicketViewDetailed extends v.InferInput<typeof ticketViewDetailedSchema> {}
