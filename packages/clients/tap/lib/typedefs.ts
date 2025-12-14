import * as v from '@badrap/valita';

import { isDid, isHandle, isNsid, isRecordKey, isTid } from '@atcute/lexicons/syntax';

import type * as t from './types.js';

const didString = v.string().assert(isDid, `must be a did`);
const handleString = v.string().assert(isHandle, `must be a handle`);
const nsidString = v.string().assert(isNsid, `must be an nsid`);
const rkeyString = v.string().assert(isRecordKey, `must be a record key`);
const tidString = v.string().assert(isTid, `must be a tid`);

const integer = v
	.number()
	.assert((input) => input >= 0 && Number.isSafeInteger(input), `must be a nonnegative integer`);

const recordEventDataSchema = v.object({
	did: didString,
	rev: tidString,
	collection: nsidString,
	rkey: rkeyString,
	action: v.union(v.literal('create'), v.literal('update'), v.literal('delete')),
	record: v.record(v.unknown()).optional(),
	cid: v.string().optional(),
	live: v.boolean(),
});

const identityEventDataSchema = v.object({
	did: didString,
	handle: handleString,
	is_active: v.boolean(),
	status: v.union(
		v.literal('active'),
		v.literal('takendown'),
		v.literal('suspended'),
		v.literal('deactivated'),
		v.literal('deleted'),
	),
});

export const tapRecordEventWireSchema = v.object({
	id: integer,
	type: v.literal('record'),
	record: recordEventDataSchema,
});

export const tapIdentityEventWireSchema = v.object({
	id: integer,
	type: v.literal('identity'),
	identity: identityEventDataSchema,
});

export const tapEventWireSchema = v.union(tapRecordEventWireSchema, tapIdentityEventWireSchema);

export const repoInfoSchema: v.Type<t.RepoInfo> = v.object({
	did: didString,
	handle: handleString,
	state: v.string(),
	rev: tidString,
	records: integer,
	error: v.string().optional(),
	retries: integer.optional(),
});

export const flattenTapEvent = (wire: v.Infer<typeof tapEventWireSchema>): t.TapEvent => {
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
			return {
				id: wire.id,
				type: 'record',
				live: wire.record.live,

				rev: wire.record.rev,
				did: wire.record.did,
				collection: wire.record.collection,
				rkey: wire.record.rkey,
				cid: wire.record.cid,
				action: wire.record.action,
				record: wire.record.record,
			};
		}

		default: {
			wire satisfies never;

			const obj = wire as any;
			throw new Error(`unknown "${obj.type}" type`);
		}
	}
};
