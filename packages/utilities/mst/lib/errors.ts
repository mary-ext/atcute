/**
 * thrown when an MST key is invalid or malformed
 */
export class InvalidMstKeyError extends Error {
	constructor(public key: string) {
		super(`invalid mst key; key=${key}`);
	}
}

/**
 * thrown when a referenced block cannot be found in the store
 */
export class MissingBlockError extends Error {
	constructor(
		public cid: string,
		public def?: string,
	) {
		super(`missing block in store; cid=${cid}` + (def ? `; type=${def}` : ``));
	}
}

/**
 * thrown when a block's decoded object doesn't match the expected type
 */
export class UnexpectedObjectError extends Error {
	constructor(
		public cid: string,
		public def: string,
	) {
		super(`unexpected object in store; cid=${cid}; expected=${def}`);
	}
}
