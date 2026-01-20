import type { Did, Handle, Nsid, RecordKey, Tid } from '@atcute/lexicons/syntax';

import type { CloseEvent, ErrorEvent, Options } from 'partysocket/ws';

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

export interface RepoInfo {
	did: Did;
	handle: Handle;
	state: string;
	rev: Tid;
	records: number;
	error?: string;
	retries?: number;
}

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
