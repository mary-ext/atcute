import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _reviewStateSchema = /*#__PURE__*/ v.string<
	'approved' | 'changes-required' | 'commented' | 'dismissed' | (string & {})
>();

type reviewState$schematype = typeof _reviewStateSchema;

export interface reviewStateSchema extends reviewState$schematype {}

export const reviewStateSchema = _reviewStateSchema as reviewStateSchema;

export type ReviewState = v.InferInput<typeof reviewStateSchema>;
