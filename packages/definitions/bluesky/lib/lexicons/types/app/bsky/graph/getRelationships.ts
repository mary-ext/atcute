import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyGraphDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.graph.getRelationships', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Primary account requesting relationships for.
		 */
		actor: /*#__PURE__*/ v.actorIdentifierString(),
		/**
		 * List of 'other' accounts to be related back to the primary.
		 * @maxLength 30
		 */
		others: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.actorIdentifierString()), [
				/*#__PURE__*/ v.arrayLength(0, 30),
			]),
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			actor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			get relationships() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						AppBskyGraphDefs.notFoundActorSchema,
						AppBskyGraphDefs.relationshipSchema,
					]),
				);
			},
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
		'app.bsky.graph.getRelationships': mainSchema;
	}
}
