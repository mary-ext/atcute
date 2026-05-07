import {
	isDid,
	isHandle,
	isNsid,
	isRecordKey,
	isTid,
	type Did,
	type Handle,
	type Nsid,
	type RecordKey,
	type Tid,
} from '@atcute/lexicons/syntax';

import * as v from 'valibot';

import type * as t from './types.ts';

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
	v.check((input) => isRecordKey(input), `must be a record key`),
	v.transform((value) => value as RecordKey),
);
const tidString: v.GenericSchema<unknown, Tid> = v.pipe(
	v.string(),
	v.check((input) => isTid(input), `must be a tid`),
	v.transform((value) => value as Tid),
);

const integer = v.pipe(v.number(), v.safeInteger(), v.minValue(0));

const baseRecordEventEntries = {
	did: didString,
	rev: tidString,
	collection: nsidString,
	rkey: rkeyString,
	live: v.boolean(),
};

const recordEventCreateDataSchema = v.looseObject({
	...baseRecordEventEntries,
	action: v.literal('create'),
	cid: v.string(),
	record: v.optional(v.record(v.string(), v.unknown())),
});

const recordEventUpdateDataSchema = v.looseObject({
	...baseRecordEventEntries,
	action: v.literal('update'),
	cid: v.string(),
	record: v.optional(v.record(v.string(), v.unknown())),
});

const recordEventDeleteDataSchema = v.looseObject({
	...baseRecordEventEntries,
	action: v.literal('delete'),
});

const recordEventDataSchema = v.union([
	recordEventCreateDataSchema,
	recordEventUpdateDataSchema,
	recordEventDeleteDataSchema,
]);

const identityEventDataSchema = v.looseObject({
	did: didString,
	handle: handleString,
	is_active: v.boolean(),
	status: v.union([
		v.literal('active'),
		v.literal('takendown'),
		v.literal('suspended'),
		v.literal('deactivated'),
		v.literal('deleted'),
	]),
});

export const tapRecordEventWireSchema = v.looseObject({
	id: integer,
	type: v.literal('record'),
	record: recordEventDataSchema,
});

export const tapIdentityEventWireSchema = v.looseObject({
	id: integer,
	type: v.literal('identity'),
	identity: identityEventDataSchema,
});

export const tapEventWireSchema = v.union([tapRecordEventWireSchema, tapIdentityEventWireSchema]);

export const repoInfoSchema: v.GenericSchema<unknown, t.RepoInfo> = v.looseObject({
	did: didString,
	handle: handleString,
	state: v.string(),
	rev: tidString,
	records: integer,
	error: v.optional(v.string()),
	retries: v.optional(integer),
});

export const flattenTapEvent = (wire: v.InferOutput<typeof tapEventWireSchema>): t.TapEvent => {
	switch (wire.type) {
		case 'identity': {
			return {
				id: wire.id,
				type: 'identity',

				did: wire.identity.did,
				handle: wire.identity.handle,
				isActive: wire.identity.is_active,
				status: wire.identity.status,
			};
		}

		case 'record': {
			switch (wire.record.action) {
				case 'create':
				case 'update': {
					return {
						id: wire.id,
						type: 'record',
						live: wire.record.live,

						rev: wire.record.rev,
						did: wire.record.did,
						collection: wire.record.collection,
						rkey: wire.record.rkey,

						action: wire.record.action,
						cid: wire.record.cid,
						record: wire.record.record,
					};
				}

				case 'delete': {
					return {
						id: wire.id,
						type: 'record',
						live: wire.record.live,

						rev: wire.record.rev,
						did: wire.record.did,
						collection: wire.record.collection,
						rkey: wire.record.rkey,

						action: 'delete',
					};
				}

				default: {
					wire.record satisfies never;

					const obj = wire.record as any;
					throw new Error(`unknown "${obj.action}" action`);
				}
			}
		}

		default: {
			wire satisfies never;

			const obj = wire as any;
			throw new Error(`unknown "${obj.type}" type`);
		}
	}
};
