/** thrown when a block's bytes do not match its CID */
export class CarBlockMismatchError extends Error {
	/** expected CID */
	cid: string;
	/** CID computed from the block's bytes */
	actual: string;

	constructor(cid: string, actual: string) {
		super(`car block does not match its cid; expected=${cid}; actual=${actual}`);
		this.cid = cid;
		this.actual = actual;
	}
}
