import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyContactDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.contact.getSyncStatus', {
	params: /*#__PURE__*/ v.object({}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * If present, indicates the user has imported their contacts. If not present, indicates the user never used the feature or called `app.bsky.contact.removeData` and didn't import again since.
			 */
			get syncStatus() {
				return /*#__PURE__*/ v.optional(AppBskyContactDefs.syncStatusSchema);
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
		'app.bsky.contact.getSyncStatus': mainSchema;
	}
}
