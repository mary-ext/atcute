import type { Did } from '@atcute/lexicons/syntax';

export type DidPlcString = Did<'plc'>;

export type DidKeyString = Did<'key'>;

export interface UnsignedLegacyCreateOperation {
	type: 'create';
	prev: null;
	signingKey: DidKeyString;
	recoveryKey: DidKeyString;
	handle: string;
	service: string;
}

export interface LegacyCreateOperation extends UnsignedLegacyCreateOperation {
	sig: string;
}

export interface Service {
	type: string;
	endpoint: string;
}

export interface UnsignedOperation {
	type: 'plc_operation';
	prev: string | null;
	alsoKnownAs: string[];
	rotationKeys: DidKeyString[];
	verificationMethods: Record<string, DidKeyString>;
	services: Record<string, Service>;
}

export interface Operation extends UnsignedOperation {
	sig: string;
}

export interface UnsignedTombstone {
	type: 'plc_tombstone';
	prev: string;
}

export interface Tombstone extends UnsignedTombstone {
	sig: string;
}

export type CompatibleOperation = Operation | LegacyCreateOperation;

export type CompatibleOperationOrTombstone = CompatibleOperation | Tombstone;

export type OperationOrTombstone = Operation | Tombstone;

export type OperationLog = [genesis: CompatibleOperation, ...OperationOrTombstone[]];

export interface IndexedEntry<T extends CompatibleOperationOrTombstone = CompatibleOperationOrTombstone> {
	did: DidPlcString;
	operation: T;
	cid: string;
	nullified: boolean;
	createdAt: string;
}

export interface IndexedEntryWithSigner<
	T extends CompatibleOperationOrTombstone = CompatibleOperationOrTombstone,
> extends IndexedEntry<T> {
	allowedSigners: DidKeyString[];
	signedBy: DidKeyString;
}

export type IndexedEntryLog = [
	genesis: IndexedEntry<CompatibleOperation>,
	...IndexedEntry<OperationOrTombstone>[],
];

// #region client response types

/**
 * current identity state derived from the did:plc operation log
 */
export interface PlcState {
	did: DidPlcString;
	rotationKeys: DidKeyString[];
	verificationMethods: Record<string, DidKeyString>;
	alsoKnownAs: string[];
	services: Record<string, Service>;
}

/**
 * operation entry with sequence number from /export endpoint
 */
export interface SequencedEntry extends IndexedEntry {
	type: 'sequenced_op';
	seq: number;
}

// #endregion
