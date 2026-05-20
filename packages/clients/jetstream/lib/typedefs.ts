import {
	type Cid,
	type Datetime,
	type Did,
	type Handle,
	type Nsid,
	type RecordKey,
	type Tid,
	isCid,
	isDatetime,
	isDid,
	isHandle,
	isNsid,
	isRecordKey,
	isTid,
} from '@atcute/lexicons/syntax';

import * as v from 'valibot';

const cidString = v.custom<Cid>(isCid, `must be a cid`);
const datetimeString = v.custom<Datetime>(isDatetime, `must be a datetime`);
const didString = v.custom<Did>(isDid, `must be a did`);
const handleString = v.custom<Handle>(isHandle, `must be a handle`);
const nsidString = v.custom<Nsid>(isNsid, `must be an nsid`);
const rkeyString = v.custom<RecordKey>(isRecordKey, `must be a rkey`);
const tidString = v.custom<Tid>(isTid, `must be a tid`);

const integer = v.pipe(v.number(), v.safeInteger(), v.minValue(0));

const baseCommitEntries = {
	rev: tidString,
	collection: nsidString,
	rkey: rkeyString,
};

export const createCommitSchema = v.looseObject({
	...baseCommitEntries,
	operation: v.literal('create'),
	cid: cidString,
	record: v.record(v.string(), v.unknown()),
});

export const updateCommitSchema = v.looseObject({
	...baseCommitEntries,
	operation: v.literal('update'),
	cid: cidString,
	record: v.record(v.string(), v.unknown()),
});

export const deleteCommitSchema = v.looseObject({
	...baseCommitEntries,
	operation: v.literal('delete'),
});

export const commitOperationSchema = v.variant('operation', [
	createCommitSchema,
	updateCommitSchema,
	deleteCommitSchema,
]);

const baseEventEntries = {
	did: didString,
	time_us: integer,
};

export const commitEventSchema = v.looseObject({
	...baseEventEntries,
	kind: v.literal('commit'),
	commit: commitOperationSchema,
});

export const identityDataSchema = v.looseObject({
	did: didString,
	handle: handleString,
	seq: integer,
	time: datetimeString,
});

export const identityEventSchema = v.looseObject({
	...baseEventEntries,
	kind: v.literal('identity'),
	identity: identityDataSchema,
});

export const accountDataSchema = v.looseObject({
	did: didString,
	active: v.boolean(),
	seq: integer,
	time: datetimeString,
});

export const accountEventSchema = v.looseObject({
	...baseEventEntries,
	kind: v.literal('account'),
	account: accountDataSchema,
});

export const jetstreamEventSchema = v.variant('kind', [
	commitEventSchema,
	identityEventSchema,
	accountEventSchema,
]);

export const optionsUpdatePayloadSchema = v.looseObject({
	wantedCollections: v.optional(v.array(v.string())),
	wantedDids: v.optional(v.array(didString)),
	maxMessageSizeBytes: v.optional(integer),
});

export const optionsUpdateProcedureSchema = v.looseObject({
	type: v.literal('options_update'),
	payload: optionsUpdatePayloadSchema,
});

export const jetstreamProcedureSchema = v.variant('type', [optionsUpdateProcedureSchema]);

export type CreateCommit = v.InferOutput<typeof createCommitSchema>;
export type UpdateCommit = v.InferOutput<typeof updateCommitSchema>;
export type DeleteCommit = v.InferOutput<typeof deleteCommitSchema>;
export type CommitOperation = v.InferOutput<typeof commitOperationSchema>;

export type CommitEvent = v.InferOutput<typeof commitEventSchema>;
export type IdentityData = v.InferOutput<typeof identityDataSchema>;
export type IdentityEvent = v.InferOutput<typeof identityEventSchema>;
export type AccountData = v.InferOutput<typeof accountDataSchema>;
export type AccountEvent = v.InferOutput<typeof accountEventSchema>;
export type JetstreamEvent = v.InferOutput<typeof jetstreamEventSchema>;

export type OptionsUpdatePayload = v.InferOutput<typeof optionsUpdatePayloadSchema>;
export type OptionsUpdateProcedure = v.InferOutput<typeof optionsUpdateProcedureSchema>;
export type JetstreamProcedure = v.InferOutput<typeof jetstreamProcedureSchema>;
