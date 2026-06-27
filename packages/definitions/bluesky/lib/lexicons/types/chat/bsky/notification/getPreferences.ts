import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyNotificationDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.notification.getPreferences', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get preferences() {
				return ChatBskyNotificationDefs.preferencesSchema;
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'chat.bsky.notification.getPreferences': mainSchema;
	}
}
