import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _banSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.spindle.mod.defs#ban')),
	/** time at which the ban was created */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** DID of the banned subject, either a repository or its owner */
	did: /*#__PURE__*/ v.didString(),
});

type ban$schematype = typeof _banSchema;

export interface banSchema extends ban$schematype {}

export const banSchema = _banSchema as banSchema;

export interface Ban extends v.InferInput<typeof banSchema> {}
