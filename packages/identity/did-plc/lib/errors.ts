import * as t from './types.ts';

export class PlcError extends Error {
	override name = 'PlcError';
}

export class ImproperOperationError extends PlcError {
	override name = 'ImproperOperationError';

	operation: t.IndexedEntry;
	reason: string;

	constructor(operation: t.IndexedEntry, reason: string) {
		super(`improper operation; cid=${operation.cid}; reason=${reason}`);
		this.operation = operation;
		this.reason = reason;
	}
}

export class InvalidSignatureError extends PlcError {
	override name = 'InvalidSignatureError';

	operation: t.IndexedEntry;

	constructor(operation: t.IndexedEntry) {
		super(`invalid signature; cid=${operation.cid}`);
		this.operation = operation;
	}
}

export class InvalidHashError extends PlcError {
	override name = 'InvalidHashError';

	operation: t.IndexedEntry;
	expected: string;

	constructor(operation: t.IndexedEntry, expected: string) {
		super(`invalid hash; expected=${expected}; got=${operation.cid}`);
		this.operation = operation;
		this.expected = expected;
	}
}

export class GenesisHashError extends PlcError {
	override name = 'GenesisHashError';

	operation: t.IndexedEntry;
	did: t.DidPlcString;

	constructor(operation: t.IndexedEntry, did: t.DidPlcString) {
		super(`mismatching genesis hash; did=${did}; cid=${operation.cid}`);
		this.operation = operation;
		this.did = did;
	}
}

export class LateDisputeError extends PlcError {
	override name = 'LateDisputeError';

	operation: t.IndexedEntry;
	lapsed: number;

	constructor(operation: t.IndexedEntry, lapsed: number) {
		super(`dispute occured outside of permitted window; cid=${operation.cid}; lapsed=${lapsed}`);
		this.operation = operation;
		this.lapsed = lapsed;
	}
}
