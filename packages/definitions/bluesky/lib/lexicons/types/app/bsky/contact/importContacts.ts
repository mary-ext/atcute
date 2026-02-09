import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyContactDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.contact.importContacts', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * List of phone numbers in global E.164 format (e.g., '+12125550123'). Phone numbers that cannot be normalized into a valid phone number will be discarded. Should not repeat the 'phone' input used in `app.bsky.contact.verifyPhone`.
			 * @minLength 1
			 * @maxLength 1000
			 */
			contacts: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
				/*#__PURE__*/ v.arrayLength(1, 1000),
			]),
			/**
			 * JWT to authenticate the call. Use the JWT received as a response to the call to `app.bsky.contact.verifyPhone`.
			 */
			token: /*#__PURE__*/ v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The users that matched during import and their indexes on the input contacts, so the client can correlate with its local list.
			 */
			get matchesAndContactIndexes() {
				return /*#__PURE__*/ v.array(AppBskyContactDefs.matchAndContactIndexSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'app.bsky.contact.importContacts': mainSchema;
	}
}
