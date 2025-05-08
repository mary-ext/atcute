import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyVideoDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('app.bsky.video.uploadVideo', {
	params: null,
	input: {
		type: 'blob',
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

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'app.bsky.video.uploadVideo': mainSchema;
	}
}
