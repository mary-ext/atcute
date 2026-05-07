import {
	isCid,
	isDatetime,
	isDid,
	isHandle,
	isNsid,
	isRecordKey,
	isTid,
	type Cid,
	type Datetime,
	type Did,
	type Handle,
	type Nsid,
	type RecordKey,
	type Tid,
} from '@atcute/lexicons/syntax';

import * as v from 'valibot';

import type * as t from './types.ts';

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

export const createCommitSchema: v.GenericSchema<unknown, t.CreateCommit> = v.looseObject({
	...baseCommitEntries,
	operation: v.literal('create'),
	cid: cidString,
	record: v.record(v.string(), v.unknown()),
});

export const updateCommitSchema: v.GenericSchema<unknown, t.UpdateCommit> = v.looseObject({
	...baseCommitEntries,
	operation: v.literal('update'),
	cid: cidString,
	record: v.record(v.string(), v.unknown()),
});

export const deleteCommitSchema: v.GenericSchema<unknown, t.DeleteCommit> = v.looseObject({
	...baseCommitEntries,
	operation: v.literal('delete'),
});

export const commitOperationSchema: v.GenericSchema<unknown, t.CommitOperation> = v.union([
	createCommitSchema,
	updateCommitSchema,
	deleteCommitSchema,
]);

const baseEventEntries = {
	did: didString,
	time_us: integer,
};

export const commitEventSchema: v.GenericSchema<unknown, t.CommitEvent> = v.looseObject({
	...baseEventEntries,
	kind: v.literal('commit'),
	commit: commitOperationSchema,
});

export const identityDataSchema: v.GenericSchema<unknown, t.IdentityData> = v.looseObject({
	did: didString,
	handle: handleString,
	seq: integer,
	time: datetimeString,
});

export const identityEventSchema: v.GenericSchema<unknown, t.IdentityEvent> = v.looseObject({
	...baseEventEntries,
	kind: v.literal('identity'),
	identity: identityDataSchema,
});

export const accountDataSchema: v.GenericSchema<unknown, t.AccountData> = v.looseObject({
	did: didString,
	active: v.boolean(),
	seq: integer,
	time: datetimeString,
});

export const accountEventSchema: v.GenericSchema<unknown, t.AccountEvent> = v.looseObject({
	...baseEventEntries,
	kind: v.literal('account'),
	account: accountDataSchema,
});

export const jetstreamEventSchema: v.GenericSchema<unknown, t.JetstreamEvent> = v.union([
	commitEventSchema,
	identityEventSchema,
	accountEventSchema,
]);

export const optionsUpdatePayloadSchema: v.GenericSchema<unknown, t.OptionsUpdatePayload> = v.looseObject({
	wantedCollections: v.optional(v.array(v.string())),
	wantedDids: v.optional(v.array(didString)),
	maxMessageSizeBytes: v.optional(integer),
});

export const optionsUpdateProcedureSchema: v.GenericSchema<unknown, t.OptionsUpdateProcedure> = v.looseObject(
	{
		type: v.literal('options_update'),
		payload: optionsUpdatePayloadSchema,
	},
);

export const jetstreamProcedureSchema: v.GenericSchema<unknown, t.JetstreamProcedure> = v.union([
	optionsUpdateProcedureSchema,
]);
