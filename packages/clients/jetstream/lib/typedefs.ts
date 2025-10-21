import type { Cid, Datetime, Did, Handle, Nsid, RecordKey, Tid } from '@atcute/lexicons/syntax';

interface BaseCommit {
	rev: Tid;
	collection: Nsid;
	rkey: RecordKey;
}

export interface CreateCommit extends BaseCommit {
	operation: 'create';
	cid: Cid;
	record: unknown;
}

export interface UpdateCommit extends BaseCommit {
	operation: 'update';
	cid: Cid;
	record: unknown;
}

export interface DeleteCommit extends BaseCommit {
	operation: 'delete';
}

export type CommitOperation = CreateCommit | UpdateCommit | DeleteCommit;

interface BaseEvent {
	did: Did;
	time_us: number;
}

export interface CommitEvent extends BaseEvent {
	kind: 'commit';
	commit: CommitOperation;
}

export interface IdentityData {
	did: Did;
	handle: Handle;
	seq: number;
	time: Datetime;
}

export interface IdentityEvent extends BaseEvent {
	kind: 'identity';
	identity: IdentityData;
}

export interface AccountData {
	did: Did;
	active: boolean;
	seq: number;
	time: Datetime;
}

export interface AccountEvent extends BaseEvent {
	kind: 'account';
	account: AccountData;
}

export type JetstreamEvent = CommitEvent | IdentityEvent | AccountEvent;

export interface OptionsUpdatePayload {
	wantedCollections?: string[];
	wantedDids?: Did[];
	maxMessageSizeBytes?: number;
}

export interface OptionsUpdateProcedure {
	type: 'options_update';
	payload: OptionsUpdatePayload;
}

export type JetstreamProcedure = OptionsUpdateProcedure;
