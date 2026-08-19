import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.notification.listRecipients', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Optional collection NSID to filter subscribers by subscription scope. Only subscribers with no
		 * collection filter or a filter containing this NSID are returned.
		 */
		collection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.nsidString()),
		/** at-uri of the entity (for entity-level subscribers) or a repo DID (for repo-level subscribers). */
		subject: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			dids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.notification.listRecipients': mainSchema;
	}
}
