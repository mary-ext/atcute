import type { Did, Handle, Nsid, RecordKey, Tid } from '@atcute/lexicons/syntax';
import type { CloseEvent, ErrorEvent, Options } from 'partysocket/ws';

export type TapRecordAction = 'create' | 'update' | 'delete';

export type TapRepoStatus = 'active' | 'takendown' | 'suspended' | 'deactivated' | 'deleted';

export interface TapRecordEvent {
	id: number;
	type: 'record';

	live: boolean;
	did: Did;
	rev: Tid;
	collection: Nsid;
	rkey: RecordKey;
	action: TapRecordAction;
	record?: Record<string, unknown>;
	cid?: string;
}

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
