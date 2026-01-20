import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ComWhtwndBlogDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.whtwnd.blog.getAuthorPosts', {
	params: /*#__PURE__*/ v.object({
		author: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get post() {
				return /*#__PURE__*/ v.array(ComWhtwndBlogDefs.blogEntrySchema);
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
		'com.whtwnd.blog.getAuthorPosts': mainSchema;
	}
}
