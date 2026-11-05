import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _actorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.actor.searchActorsTypeahead#actor')),
	did: /*#__PURE__*/ v.didString(),
	handle: /*#__PURE__*/ v.handleString(),
	/** AT-URI for the actor's Tangled profile. */
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.actor.searchActorsTypeahead', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @default 10
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			10,
		),
		/**
		 * The beginning of a handle. A leading \@ is optional.
		 *
		 * @minLength 1
		 * @maxLength 254
		 */
		q: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 254)]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get actors() {
				return /*#__PURE__*/ v.array(actorSchema);
			},
		}),
	},
});

type actor$schematype = typeof _actorSchema;
type main$schematype = typeof _mainSchema;

export interface actorSchema extends actor$schematype {}
export interface mainSchema extends main$schematype {}

export const actorSchema = _actorSchema as actorSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Actor extends v.InferInput<typeof actorSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.actor.searchActorsTypeahead': mainSchema;
	}
}
