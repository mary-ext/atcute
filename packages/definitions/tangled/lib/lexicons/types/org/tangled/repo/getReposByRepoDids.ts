import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _listItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.repo.getReposByRepoDids#listItem')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	uri: /*#__PURE__*/ v.resourceUriString(),
	/** sh.tangled.repo record */
	value: /*#__PURE__*/ v.unknown(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.repo.getReposByRepoDids', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Repo DIDs to fetch. DIDs that resolve to none are omitted from the response.
		 *
		 * @minLength 1
		 * @maxLength 50
		 */
		dids: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
			/*#__PURE__*/ v.arrayLength(1, 50),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get items() {
				return /*#__PURE__*/ v.array(listItemSchema);
			},
		}),
	},
});

type listItem$schematype = typeof _listItemSchema;
type main$schematype = typeof _mainSchema;

export interface listItemSchema extends listItem$schematype {}
export interface mainSchema extends main$schematype {}

export const listItemSchema = _listItemSchema as listItemSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface ListItem extends v.InferInput<typeof listItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.repo.getReposByRepoDids': mainSchema;
	}
}
