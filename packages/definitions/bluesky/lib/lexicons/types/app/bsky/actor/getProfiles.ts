import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.actor.getProfiles', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @minLength 1
		 * @maxLength 25
		 */
		actors: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.actorIdentifierString()), [
			/*#__PURE__*/ v.arrayLength(1, 25),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get profiles() {
				return /*#__PURE__*/ v.array(AppBskyActorDefs.profileViewDetailedSchema);
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
		'app.bsky.actor.getProfiles': mainSchema;
	}
}
