import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _recordDeletedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.notification.defs#recordDeleted')),
});

type recordDeleted$schematype = typeof _recordDeletedSchema;

export interface recordDeletedSchema extends recordDeleted$schematype {}

export const recordDeletedSchema = _recordDeletedSchema as recordDeletedSchema;

export interface RecordDeleted extends v.InferInput<typeof recordDeletedSchema> {}
