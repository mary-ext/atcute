import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _hostStatusSchema = /*#__PURE__*/ v.string<
	'active' | 'idle' | 'offline' | 'throttled' | 'banned' | (string & {})
>();

type hostStatus$schematype = typeof _hostStatusSchema;

/** @deprecated */
export interface hostStatus$schema extends hostStatus$schematype {}

export const hostStatusSchema = _hostStatusSchema as hostStatus$schema;

export type HostStatus = v.InferInput<typeof hostStatusSchema>;
