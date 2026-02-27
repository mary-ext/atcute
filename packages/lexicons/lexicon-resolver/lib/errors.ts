import type { Nsid } from '@atcute/lexicons/syntax';

// #region Lexicon authority resolution errors
export class LexiconAuthorityResolutionError extends Error {
	override name = 'LexiconAuthorityResolutionError';
}

export class AuthorityNotFoundError extends LexiconAuthorityResolutionError {
	override name = 'AuthorityNotFoundError';

	nsid: Nsid;

	constructor(nsid: Nsid) {
		super(`lexicon authority not found; nsid=${nsid}`);
		this.nsid = nsid;
	}
}

export class FailedAuthorityResolutionError extends LexiconAuthorityResolutionError {
	override name = 'FailedAuthorityResolutionError';

	nsid: Nsid;

	constructor(nsid: Nsid, options?: ErrorOptions) {
		super(`failed to resolve lexicon authority; nsid=${nsid}`, options);
		this.nsid = nsid;
	}
}

export class InvalidResolvedAuthorityError extends LexiconAuthorityResolutionError {
	override name = 'InvalidResolvedAuthorityError';

	nsid: Nsid;
	did: string;

	constructor(nsid: Nsid, did: string) {
		super(`lexicon authority returned invalid did; nsid=${nsid}; did=${did}`);
		this.nsid = nsid;
		this.did = did;
	}
}

export class AmbiguousAuthorityError extends LexiconAuthorityResolutionError {
	override name = 'AmbiguousAuthorityError';

	nsid: Nsid;

	constructor(nsid: Nsid) {
		super(`lexicon authority returned multiple did values; nsid=${nsid}`);
		this.nsid = nsid;
	}
}
// #endregion

// #region Lexicon resolution errors
export class LexiconResolutionError extends Error {
	override name = 'LexiconResolutionError';
}

export class FailedLexiconResolutionError extends LexiconResolutionError {
	override name = 'FailedLexiconResolutionError';

	nsid: Nsid;

	constructor(nsid: Nsid, options?: ErrorOptions) {
		super(`failed to resolve lexicon; nsid=${nsid}`, options);
		this.nsid = nsid;
	}
}

export class InvalidLexiconSchemaError extends LexiconResolutionError {
	override name = 'InvalidLexiconSchemaError';

	nsid: Nsid;

	constructor(nsid: Nsid, options?: ErrorOptions) {
		super(`invalid lexicon schema; nsid=${nsid}`, options);
		this.nsid = nsid;
	}
}

export class InvalidLexiconProofError extends LexiconResolutionError {
	override name = 'InvalidLexiconProofError';

	nsid: Nsid;

	constructor(nsid: Nsid, options?: ErrorOptions) {
		super(`invalid lexicon record proof; nsid=${nsid}`, options);
		this.nsid = nsid;
	}
}
// #endregion
