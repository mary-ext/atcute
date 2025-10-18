export class InvalidMstKeyError extends Error {
	constructor(public key: string) {
		super(`invalid mst key; key=${key}`);
	}
}

export class MissingBlockError extends Error {
	constructor(
		public cid: string,
		public def?: string,
	) {
		super(`missing block in store; cid=${cid}` + (def ? `; type=${def}` : ``));
	}
}

export class UnexpectedObjectError extends Error {
	constructor(
		public cid: string,
		public def: string,
	) {
		super(`unexpected object in store; cid=${cid}; expected=${def}`);
	}
}
