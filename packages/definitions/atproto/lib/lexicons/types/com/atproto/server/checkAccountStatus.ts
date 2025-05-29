import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.server.checkAccountStatus', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			activated: /*#__PURE__*/ v.boolean(),
			expectedBlobs: /*#__PURE__*/ v.integer(),
			importedBlobs: /*#__PURE__*/ v.integer(),
			indexedRecords: /*#__PURE__*/ v.integer(),
			privateStateValues: /*#__PURE__*/ v.integer(),
			repoBlocks: /*#__PURE__*/ v.integer(),
			repoCommit: /*#__PURE__*/ v.cidString(),
			repoRev: /*#__PURE__*/ v.string(),
			validDid: /*#__PURE__*/ v.boolean(),
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
		'com.atproto.server.checkAccountStatus': mainSchema;
	}
}
