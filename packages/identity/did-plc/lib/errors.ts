import * as t from './types.js';

export class PlcError extends Error {
	override name = 'PlcError';
}

export class ImproperOperationError extends PlcError {
	override name = 'ImproperOperationError';

	constructor(operation: t.IndexedEntry, reason: string) {
		super(`improper operation; cid=${operation.cid}; reason=${reason}`);
	}
}

export class InvalidSignatureError extends PlcError {
	override name = 'InvalidSignatureError';

	constructor(operation: t.IndexedEntry) {
		super(`invalid signature; cid=${operation.cid}`);
	}
}

export class InvalidHashError extends PlcError {
	override name = 'InvalidHashError';

	constructor(operation: t.IndexedEntry, expected: string) {
		super(`invalid hash; expected=${expected}; got=${operation.cid}`);
	}
}

export class GenesisHashError extends PlcError {
	override name = 'GenesisHashError';

	constructor(operation: t.IndexedEntry, did: t.DidPlcString) {
		super(`mismatching genesis hash; did=${did}; cid=${operation.cid}`);
	}
}

export class LateDisputeError extends PlcError {
	override name = 'LateDisputeError';

	constructor(operation: t.IndexedEntry, lapsed: number) {
		super(`dispute occured outside of permitted window; cid=${operation.cid}; lapsed=${lapsed}`);
	}
}
