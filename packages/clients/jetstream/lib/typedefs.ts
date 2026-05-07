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

const cidString: v.GenericSchema<unknown, Cid> = v.pipe(
	v.string(),
	v.check((input) => isCid(input), `must be a cid`),
	v.transform((value) => value as Cid),
);
const datetimeString: v.GenericSchema<unknown, Datetime> = v.pipe(
	v.string(),
	v.check((input) => isDatetime(input), `must be a datetime`),
	v.transform((value) => value as Datetime),
);
const didString: v.GenericSchema<unknown, Did> = v.pipe(
	v.string(),
	v.check((input) => isDid(input), `must be a did`),
	v.transform((value) => value as Did),
);
const handleString: v.GenericSchema<unknown, Handle> = v.pipe(
	v.string(),
	v.check((input) => isHandle(input), `must be a handle`),
	v.transform((value) => value as Handle),
);
const nsidString: v.GenericSchema<unknown, Nsid> = v.pipe(
	v.string(),
	v.check((input) => isNsid(input), `must be an nsid`),
	v.transform((value) => value as Nsid),
);
const rkeyString: v.GenericSchema<unknown, RecordKey> = v.pipe(
	v.string(),
	v.check((input) => isRecordKey(input), `must be a rkey`),
	v.transform((value) => value as RecordKey),
);
const tidString: v.GenericSchema<unknown, Tid> = v.pipe(
	v.string(),
	v.check((input) => isTid(input), `must be a tid`),
	v.transform((value) => value as Tid),
);

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
