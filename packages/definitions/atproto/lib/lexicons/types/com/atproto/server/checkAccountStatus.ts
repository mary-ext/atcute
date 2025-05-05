import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.server.checkAccountStatus', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			activated: /*#__PURE__*/ v.boolean(),
			validDid: /*#__PURE__*/ v.boolean(),
			repoCommit: /*#__PURE__*/ v.string(),
			repoRev: /*#__PURE__*/ v.string(),
			repoBlocks: /*#__PURE__*/ v.integer(),
			indexedRecords: /*#__PURE__*/ v.integer(),
			privateStateValues: /*#__PURE__*/ v.integer(),
			expectedBlobs: /*#__PURE__*/ v.integer(),
			importedBlobs: /*#__PURE__*/ v.integer(),
		}),
	},
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.checkAccountStatus': mainSchema.$schema;
	}
}
