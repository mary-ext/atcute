import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.git.getBlob', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Serve the blob as an attachment named after the file
		 *
		 * @default false
		 */
		download: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		/** Path within the repository tree */
		path: /*#__PURE__*/ v.string(),
		/**
		 * Git reference (branch, tag, or commit SHA)
		 *
		 * @default 'HEAD'
		 */
		ref: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'HEAD'),
		/** DID of the repository */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'blob',
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.git.getBlob': mainSchema;
	}
}
