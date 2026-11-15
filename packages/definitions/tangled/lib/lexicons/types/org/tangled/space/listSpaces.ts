import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.space.listSpaces', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Count of spaces to return.
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get spaces() {
				return /*#__PURE__*/ v.array(spaceViewSchema);
			},
		}),
	},
});
const _spaceViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.space.listSpaces#spaceView')),
	/**
	 * When the indexer's lease on this repo gets nuked, unless a member refreshes it. This is left out when
	 * calling as a regular user and not as a full-on indexer.
	 */
	expiresAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** The private git repo's DID. */
	uri: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;
type spaceView$schematype = typeof _spaceViewSchema;

export interface mainSchema extends main$schematype {}
export interface spaceViewSchema extends spaceView$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const spaceViewSchema = _spaceViewSchema as spaceViewSchema;

export interface SpaceView extends v.InferInput<typeof spaceViewSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.space.listSpaces': mainSchema;
	}
}
