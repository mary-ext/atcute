import * as t from './types.js';

export class PlcError extends Error {
	override name = 'PlcError';
}

export class ImproperOperationError extends PlcError {
	override name = 'ImproperOperationError';

	constructor(
		public operation: t.IndexedEntry,
		public reason: string,
	) {
		super(`improper operation; cid=${operation.cid}; reason=${reason}`);
	}
}

export class InvalidSignatureError extends PlcError {
	override name = 'InvalidSignatureError';

	constructor(public operation: t.IndexedEntry) {
		super(`invalid signature; cid=${operation.cid}`);
	}
}

export class InvalidHashError extends PlcError {
	override name = 'InvalidHashError';

	constructor(
		public operation: t.IndexedEntry,
		public expected: string,
	) {
		super(`invalid hash; expected=${expected}; got=${operation.cid}`);
	}
}

export class GenesisHashError extends PlcError {
	override name = 'GenesisHashError';

	constructor(
		public operation: t.IndexedEntry,
		public did: t.DidPlcString,
	) {
		super(`mismatching genesis hash; did=${did}; cid=${operation.cid}`);
	}
}

export class LateDisputeError extends PlcError {
	override name = 'LateDisputeError';

	constructor(
		public operation: t.IndexedEntry,
		public lapsed: number,
	) {
		super(`dispute occured outside of permitted window; cid=${operation.cid}; lapsed=${lapsed}`);
	}
}
