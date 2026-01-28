/** criteria for finding a key in a keyset */
export interface KeySearchOptions {
	/** find by specific key ID */
	kid?: string;
	/** find by algorithm (single or array of acceptable algs) */
	alg?: string | readonly string[];
}
