import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _inviteItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.repo.listCollaboratorInvitesBy#inviteItem'),
	),
	/** DID that made the offer. */
	addedBy: /*#__PURE__*/ v.didString(),
	/** When the repository made the offer. This listing sorts it by newest first. */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** did:web of knot hosting this repo. */
	knot: /*#__PURE__*/ v.didString(),
	/** DID of repo that made the offer. */
	repo: /*#__PURE__*/ v.didString(),
	/** Invite record on the repository. */
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.repo.listCollaboratorInvitesBy', {
	params: /*#__PURE__*/ v.object({
		/** Actor DID offered collaboration. */
		subject: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get items() {
				return /*#__PURE__*/ v.array(inviteItemSchema);
			},
			/** Knots that this index hasn't read yet */
			pending: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
			/**
			 * Per-subject dropped offers from items. If truncated is true, missing offers won't say if they were
			 * withdrawn, same with pending knots.
			 */
			truncated: /*#__PURE__*/ v.boolean(),
		}),
	},
});

type inviteItem$schematype = typeof _inviteItemSchema;
type main$schematype = typeof _mainSchema;

export interface inviteItemSchema extends inviteItem$schematype {}
export interface mainSchema extends main$schematype {}

export const inviteItemSchema = _inviteItemSchema as inviteItemSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface InviteItem extends v.InferInput<typeof inviteItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.repo.listCollaboratorInvitesBy': mainSchema;
	}
}
