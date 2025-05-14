import * as syntax from '@atcute/lexicons/syntax';

import * as v from '@badrap/valita';

const _cidStringSchema = v.string();

const cidStringSchema = _cidStringSchema as cidStringSchema.$schema;
declare namespace cidStringSchema {
	export {};

	type $schematype = typeof _cidStringSchema;
	export interface $schema extends $schematype {}
}
const _datetimeStringSchema = v.string().assert(syntax.isDatetime, `must be a datetime`);

const datetimeStringSchema = _datetimeStringSchema as datetimeStringSchema.$schema;
declare namespace datetimeStringSchema {
	export {};

	type $schematype = typeof _datetimeStringSchema;
	export interface $schema extends $schematype {}
}
const _didStringSchema = v.string().assert(syntax.isDid, `must be a did`);

const didStringSchema = _didStringSchema as didStringSchema.$schema;
declare namespace didStringSchema {
	export {};

	type $schematype = typeof _didStringSchema;
	export interface $schema extends $schematype {}
}
const _handleStringSchema = v.string().assert(syntax.isHandle, `must be a handle`);

const handleStringSchema = _handleStringSchema as handleStringSchema.$schema;
declare namespace handleStringSchema {
	export {};

	type $schematype = typeof _handleStringSchema;
	export interface $schema extends $schematype {}
}
const _nsidStringSchema = v.string().assert(syntax.isNsid, `must be an nsid`);

const nsidStringSchema = _nsidStringSchema as nsidStringSchema.$schema;
declare namespace nsidStringSchema {
	export {};

	type $schematype = typeof _nsidStringSchema;
	export interface $schema extends $schematype {}
}
const _rkeyStringSchema = v.string().assert(syntax.isRecordKey, `must be a rkey`);

const rkeyStringSchema = _rkeyStringSchema as rkeyStringSchema.$schema;
declare namespace rkeyStringSchema {
	export {};

	type $schematype = typeof _rkeyStringSchema;
	export interface $schema extends $schematype {}
}
const _tidStringSchema = v.string().assert(syntax.isTid, `must be a tid`);

const tidStringSchema = _tidStringSchema as tidStringSchema.$schema;
declare namespace tidStringSchema {
	export {};

	type $schematype = typeof _tidStringSchema;
	export interface $schema extends $schematype {}
}

const _integerSchema = v
	.number()
	.assert((input) => input >= 0 && Number.isSafeInteger(input), `must be a nonnegative integer`);

const integerSchema = _integerSchema as integerSchema.$schema;
declare namespace integerSchema {
	export {};

	type $schematype = typeof _integerSchema;
	export interface $schema extends $schematype {}
}

const _baseCommitSchema = v.object({
	rev: tidStringSchema,
	collection: nsidStringSchema,
	rkey: rkeyStringSchema,
});

const baseCommitSchema = _baseCommitSchema as baseCommitSchema.$schema;
declare namespace baseCommitSchema {
	export {};

	type $schematype = typeof _baseCommitSchema;
	export interface $schema extends $schematype {}
}

const _createCommitSchema = baseCommitSchema.extend({
	operation: v.literal('create'),
	cid: cidStringSchema,
	record: v.record(v.unknown()),
});

export const createCommitSchema = _createCommitSchema as createCommitSchema.$schema;
export interface CreateCommit extends v.Infer<typeof createCommitSchema> {}
export declare namespace createCommitSchema {
	export {};

	type $schematype = typeof _createCommitSchema;
	export interface $schema extends $schematype {}
}

const _updateCommitSchema = baseCommitSchema.extend({
	operation: v.literal('update'),
	cid: cidStringSchema,
	record: v.record(v.unknown()),
});

export const updateCommitSchema = _updateCommitSchema as updateCommitSchema.$schema;
export interface UpdateCommit extends v.Infer<typeof updateCommitSchema> {}
export declare namespace updateCommitSchema {
	export {};

	type $schematype = typeof _updateCommitSchema;
	export interface $schema extends $schematype {}
}

const _deleteCommitSchema = baseCommitSchema.extend({
	operation: v.literal('delete'),
});

export const deleteCommitSchema = _deleteCommitSchema as deleteCommitSchema.$schema;
export interface DeleteCommit extends v.Infer<typeof deleteCommitSchema> {}
export declare namespace deleteCommitSchema {
	export {};

	type $schematype = typeof _deleteCommitSchema;
	export interface $schema extends $schematype {}
}

const _commitOperationSchema = v.union(createCommitSchema, updateCommitSchema, deleteCommitSchema);

export const commitOperationSchema = _commitOperationSchema as commitSchema.$schema;
export type CommitOperation = v.Infer<typeof commitOperationSchema>;
export declare namespace commitSchema {
	export {};

	type $schematype = typeof _commitOperationSchema;
	export interface $schema extends $schematype {}
}

const _baseEventSchema = v.object({
	did: didStringSchema,
	time_us: integerSchema,
});

const baseEventSchema = _baseEventSchema as baseEventSchema.$schema;
declare namespace baseEventSchema {
	export {};

	type $schematype = typeof _baseEventSchema;
	export interface $schema extends $schematype {}
}

const _commitEventSchema = baseEventSchema.extend({
	kind: v.literal('commit'),
	commit: commitOperationSchema,
});

export const commitEventSchema = _commitEventSchema as commitEventSchema.$schema;
export interface CommitEvent extends v.Infer<typeof commitEventSchema> {}
export declare namespace commitEventSchema {
	export {};

	type $schematype = typeof _commitEventSchema;
	export interface $schema extends $schematype {}
}

const _identityDataSchema = v.object({
	did: didStringSchema,
	handle: handleStringSchema,
	seq: integerSchema,
	time: datetimeStringSchema,
});

export const identityDataSchema = _identityDataSchema as identityData.$schema;
export interface IdentityData extends v.Infer<typeof identityDataSchema> {}
export declare namespace identityData {
	export {};

	type $schematype = typeof _identityDataSchema;
	export interface $schema extends $schematype {}
}

const _identityEventSchema = baseEventSchema.extend({
	kind: v.literal('identity'),
	identity: identityDataSchema,
});

export const identityEventSchema = _identityEventSchema as identityEventSchema.$schema;
export interface IdentityEvent extends v.Infer<typeof identityEventSchema> {}
export declare namespace identityEventSchema {
	export {};

	type $schematype = typeof _identityEventSchema;
	export interface $schema extends $schematype {}
}

const _accountDataSchema = v.object({
	did: didStringSchema,
	active: v.boolean(),
	seq: integerSchema,
	time: datetimeStringSchema,
});

export const accountDataSchema = _accountDataSchema as accountDataSchema.$schema;
export interface AccountData extends v.Infer<typeof accountDataSchema> {}
export declare namespace accountDataSchema {
	export {};

	type $schematype = typeof _accountDataSchema;
	export interface $schema extends $schematype {}
}

const _accountEventSchema = baseEventSchema.extend({
	kind: v.literal('account'),
	account: accountDataSchema,
});

export const accountEventSchema = _accountEventSchema as accountEventSchema.$schema;
export interface AccountEvent extends v.Infer<typeof accountEventSchema> {}
export declare namespace accountEventSchema {
	export {};

	type $schematype = typeof _accountEventSchema;
	export interface $schema extends $schematype {}
}

const _jetstreamEventSchema = v.union(commitEventSchema, identityEventSchema, accountEventSchema);

export const jetstreamEventSchema = _jetstreamEventSchema as jetstreamEventSchema.$schema;
export type JetstreamEvent = v.Infer<typeof jetstreamEventSchema>;
export declare namespace jetstreamEventSchema {
	export {};

	type $schematype = typeof _jetstreamEventSchema;
	export interface $schema extends $schematype {}
}

const _optionsUpdatePayloadSchema = v.object({
	wantedCollections: v.array(v.string()).optional(),
	wantedDids: v.array(didStringSchema).optional(),
	maxMessageSizeBytes: integerSchema.optional(),
});

export const optionsUpdatePayloadSchema = _optionsUpdatePayloadSchema as optionsUpdatePayloadSchema.$schema;
export interface OptionsUpdatePayload extends v.Infer<typeof optionsUpdatePayloadSchema> {}
export declare namespace optionsUpdatePayloadSchema {
	export {};

	type $schematype = typeof _optionsUpdatePayloadSchema;
	export interface $schema extends $schematype {}
}

const _optionsUpdateProcedureSchema = v.object({
	type: v.literal('options_update'),
	payload: optionsUpdatePayloadSchema,
});

export const optionsUpdateProcedureSchema =
	_optionsUpdateProcedureSchema as optionsUpdateProcedureSchema.$schema;
export interface OptionsUpdateProcedure extends v.Infer<typeof optionsUpdateProcedureSchema> {}
export declare namespace optionsUpdateProcedureSchema {
	export {};

	type $schematype = typeof _optionsUpdateProcedureSchema;
	export interface $schema extends $schematype {}
}

const _jetstreamProcedureSchema = v.union(optionsUpdateProcedureSchema);

export const jetstreamProcedureSchema = _jetstreamProcedureSchema as jetstreamProcedureSchema.$schema;
export type JetstreamProcedure = v.Infer<typeof jetstreamProcedureSchema>;
export declare namespace jetstreamProcedureSchema {
	export {};

	type $schematype = typeof _jetstreamProcedureSchema;
	export interface $schema extends $schematype {}
}
