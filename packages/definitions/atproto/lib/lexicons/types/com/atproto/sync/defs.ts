import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _hostStatusSchema = /*#__PURE__*/ v.string<
	'active' | 'idle' | 'offline' | 'throttled' | 'banned' | (string & {})
>();

type hostStatus$schematype = typeof _hostStatusSchema;

export interface hostStatusSchema extends hostStatus$schematype {}

export const hostStatusSchema = _hostStatusSchema as hostStatusSchema;

export type HostStatus = v.InferInput<typeof hostStatusSchema>;
