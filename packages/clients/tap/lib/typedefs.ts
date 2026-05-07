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

import type { CloseEvent, ErrorEvent, Options } from 'partysocket/ws';
import * as v from 'valibot';

const didString = v.custom<Did>(isDid, `must be a did`);
const handleString = v.custom<Handle>(isHandle, `must be a handle`);
const nsidString = v.custom<Nsid>(isNsid, `must be an nsid`);
const rkeyString = v.custom<RecordKey>(isRecordKey, `must be a record key`);
const tidString = v.custom<Tid>(isTid, `must be a tid`);

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

const recordEventDataSchema = v.variant('action', [
	recordEventCreateDataSchema,
	recordEventUpdateDataSchema,
	recordEventDeleteDataSchema,
]);

const identityEventDataSchema = v.looseObject({
	did: didString,
	handle: handleString,
	is_active: v.boolean(),
	status: v.picklist(['active', 'takendown', 'suspended', 'deactivated', 'deleted']),
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

export const tapEventWireSchema = v.variant('type', [tapRecordEventWireSchema, tapIdentityEventWireSchema]);

export const repoInfoSchema = v.looseObject({
	did: didString,
	handle: handleString,
	state: v.string(),
	rev: tidString,
	records: integer,
	error: v.optional(v.string()),
	retries: v.optional(integer),
});

export type RepoInfo = v.InferOutput<typeof repoInfoSchema>;

export type TapRecordAction = 'create' | 'update' | 'delete';

export type TapRepoStatus = 'active' | 'takendown' | 'suspended' | 'deactivated' | 'deleted';

export interface TapRecordBaseEvent {
	id: number;
	type: 'record';

	live: boolean;
	did: Did;
	rev: Tid;
	collection: Nsid;
	rkey: RecordKey;
}

export interface TapRecordCreateEvent extends TapRecordBaseEvent {
	action: 'create';
	cid: string;

	/**
	 * record may be omitted if tap fails to decode the record body but still has a cid.
	 */
	record?: Record<string, unknown>;
}

export interface TapRecordUpdateEvent extends TapRecordBaseEvent {
	action: 'update';
	cid: string;

	/**
	 * record may be omitted if tap fails to decode the record body but still has a cid.
	 */
	record?: Record<string, unknown>;
}

export interface TapRecordDeleteEvent extends TapRecordBaseEvent {
	action: 'delete';
}

export type TapRecordEvent = TapRecordCreateEvent | TapRecordUpdateEvent | TapRecordDeleteEvent;

export interface TapIdentityEvent {
	id: number;
	type: 'identity';

	did: Did;
	handle: Handle;
	isActive: boolean;
	status: TapRepoStatus;
}

export type TapEvent = TapRecordEvent | TapIdentityEvent;

export interface TapClientOptions {
	url: string | URL;
	adminPassword?: string;
	fetch?: typeof globalThis.fetch;
}

export interface TapSubscribeOptions {
	/**
	 * whether to validate incoming events.
	 * @default true
	 */
	validateEvents?: boolean;

	onConnectionOpen?: (event: Event) => void;
	onConnectionClose?: (event: CloseEvent) => void;
	onConnectionError?: (event: ErrorEvent) => void;
	onError?: (error: unknown) => void;

	ws?: Options;
}

export interface TapSubscriptionMessage {
	event: TapEvent;
	ack: () => Promise<void>;
}

export const flattenTapEvent = (wire: v.InferOutput<typeof tapEventWireSchema>): TapEvent => {
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
