import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyVideoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.procedure('app.bsky.video.uploadVideo', {
	params: null,
	input: {
		type: 'blob',
		encoding: ['video/mp4'],
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get jobStatus() {
				return AppBskyVideoDefs.jobStatusSchema;
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export type $input = v.InferXRPCBodyInput<mainSchema['input']>;
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'app.bsky.video.uploadVideo': mainSchema;
	}
}
