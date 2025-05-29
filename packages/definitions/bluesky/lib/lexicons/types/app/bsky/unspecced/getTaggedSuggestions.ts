import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getTaggedSuggestions', {
	params: /*#__PURE__*/ v.object({}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get suggestions() {
				return /*#__PURE__*/ v.array(suggestionSchema);
			},
		}),
	},
});
const _suggestionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getTaggedSuggestions#suggestion'),
	),
	subject: /*#__PURE__*/ v.genericUriString(),
	subjectType: /*#__PURE__*/ v.string<'actor' | 'feed' | (string & {})>(),
	tag: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;
type suggestion$schematype = typeof _suggestionSchema;

export interface mainSchema extends main$schematype {}
export interface suggestionSchema extends suggestion$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const suggestionSchema = _suggestionSchema as suggestionSchema;

export interface Suggestion extends v.InferInput<typeof suggestionSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getTaggedSuggestions': mainSchema;
	}
}
