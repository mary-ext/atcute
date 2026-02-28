/**
 * thrown when an MST key is invalid or malformed
 */
export class InvalidMstKeyError extends Error {
	key: string;

	constructor(key: string) {
		super(`invalid mst key; key=${key}`);
		this.key = key;
	}
}

/**
 * thrown when a referenced block cannot be found in the store
 */
export class MissingBlockError extends Error {
	cid: string;
	def?: string;

	constructor(cid: string, def?: string) {
		super(`missing block in store; cid=${cid}` + (def ? `; type=${def}` : ``));
		this.cid = cid;
		this.def = def;
	}
}
