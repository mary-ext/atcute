import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ComAtprotoLexiconSchema from './schema.ts';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.lexicon.resolveLexicon', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The lexicon NSID to resolve.
		 */
		nsid: /*#__PURE__*/ v.nsidString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The CID of the lexicon schema record.
			 */
			cid: /*#__PURE__*/ v.cidString(),
			/**
			 * The resolved lexicon schema record.
			 */
			get schema() {
				return ComAtprotoLexiconSchema.mainSchema;
			},
			/**
			 * The AT-URI of the lexicon schema record.
			 */
			uri: /*#__PURE__*/ v.resourceUriString(),
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
		'com.atproto.lexicon.resolveLexicon': mainSchema;
	}
}
