import * as v from '@badrap/valita';

import { isCid, isDatetime, isDid, isHandle, isNsid, isRecordKey, isTid } from '@atcute/lexicons/syntax';

import type * as t from './types.js';

const cidString = v.string().assert(isCid, `must be a cid`);
const datetimeString = v.string().assert(isDatetime, `must be a datetime`);
const didString = v.string().assert(isDid, `must be a did`);
const handleString = v.string().assert(isHandle, `must be a handle`);
const nsidString = v.string().assert(isNsid, `must be an nsid`);
const rkeyString = v.string().assert(isRecordKey, `must be a rkey`);
const tidString = v.string().assert(isTid, `must be a tid`);

const integer = v
	.number()
	.assert((input) => input >= 0 && Number.isSafeInteger(input), `must be a nonnegative integer`);

const baseCommit = v.object({
	rev: tidString,
	collection: nsidString,
	rkey: rkeyString,
});

export const createCommitSchema: v.Type<t.CreateCommit> = baseCommit.extend({
	operation: v.literal('create'),
	cid: cidString,
	record: v.record(v.unknown()),
});

export const updateCommitSchema: v.Type<t.UpdateCommit> = baseCommit.extend({
	operation: v.literal('update'),
	cid: cidString,
	record: v.record(v.unknown()),
});

export const deleteCommitSchema: v.Type<t.DeleteCommit> = baseCommit.extend({
	operation: v.literal('delete'),
});

export const commitOperationSchema: v.Type<t.CommitOperation> = v.union(
	createCommitSchema,
	updateCommitSchema,
	deleteCommitSchema,
);

const baseEvent = v.object({
	did: didString,
	time_us: integer,
});

export const commitEventSchema: v.Type<t.CommitEvent> = baseEvent.extend({
	kind: v.literal('commit'),
	commit: commitOperationSchema,
});

export const identityDataSchema: v.Type<t.IdentityData> = v.object({
	did: didString,
	handle: handleString,
	seq: integer,
	time: datetimeString,
});

export const identityEventSchema: v.Type<t.IdentityEvent> = baseEvent.extend({
	kind: v.literal('identity'),
	identity: identityDataSchema,
});

export const accountDataSchema: v.Type<t.AccountData> = v.object({
	did: didString,
	active: v.boolean(),
	seq: integer,
	time: datetimeString,
});

export const accountEventSchema: v.Type<t.AccountEvent> = baseEvent.extend({
	kind: v.literal('account'),
	account: accountDataSchema,
});

export const jetstreamEventSchema: v.Type<t.JetstreamEvent> = v.union(
	commitEventSchema,
	identityEventSchema,
	accountEventSchema,
);

export const optionsUpdatePayloadSchema: v.Type<t.OptionsUpdatePayload> = v.object({
	wantedCollections: v.array(v.string()).optional(),
	wantedDids: v.array(didString).optional(),
	maxMessageSizeBytes: integer.optional(),
});

export const optionsUpdateProcedureSchema: v.Type<t.OptionsUpdateProcedure> = v.object({
	type: v.literal('options_update'),
	payload: optionsUpdatePayloadSchema,
});

export const jetstreamProcedureSchema: v.Type<t.JetstreamProcedure> = v.union(optionsUpdateProcedureSchema);
