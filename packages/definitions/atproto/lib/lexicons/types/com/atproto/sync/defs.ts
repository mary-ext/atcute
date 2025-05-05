import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _hostStatusSchema = /*#__PURE__*/ v.string<
	'active' | 'idle' | 'offline' | 'throttled' | 'banned' | (string & {})
>();
export const hostStatusSchema = _hostStatusSchema as hostStatusSchema.$schema;
export type HostStatus = v.InferInput<typeof hostStatusSchema>;
export declare namespace hostStatusSchema {
	export {};
	type $schematype = typeof _hostStatusSchema;
	export interface $schema extends $schematype {}
}
