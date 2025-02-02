import * as t from './types.js';

export class PlcError extends Error {}

export class ImproperOperationError extends PlcError {
	constructor(operation: t.IndexedOperation, reason: string) {
		super(`improper operation; cid=${operation.cid}; reason=${reason}`);
	}
}

export class InvalidSignatureError extends PlcError {
	constructor(operation: t.IndexedOperation) {
		super(`invalid signature; cid=${operation.cid}`);
	}
}

export class InvalidHashError extends PlcError {
	constructor(operation: t.IndexedOperation, expected: string) {
		super(`invalid hash; expected=${expected}; got=${operation.cid}`);
	}
}

export class GenesisHashError extends PlcError {
	constructor(operation: t.IndexedOperation, did: t.DidPlcString) {
		super(`mismatching genesis hash; did=${did}; cid=${operation.cid}`);
	}
}

export class LateRecoveryError extends PlcError {
	constructor(operation: t.IndexedOperation, lapsed: number) {
		super(`recovery operation occured outside of recovery window; cid=${operation.cid}; lapsed=${lapsed}`);
	}
}
