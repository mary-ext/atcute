import type { Nsid } from '@atcute/lexicons/syntax';

// #region Lexicon authority resolution errors
export class LexiconAuthorityResolutionError extends Error {
	override name = 'LexiconAuthorityResolutionError';
}

export class AuthorityNotFoundError extends LexiconAuthorityResolutionError {
	override name = 'AuthorityNotFoundError';

	constructor(public nsid: Nsid) {
		super(`lexicon authority not found; nsid=${nsid}`);
	}
}

export class FailedAuthorityResolutionError extends LexiconAuthorityResolutionError {
	override name = 'FailedAuthorityResolutionError';

	constructor(
		public nsid: Nsid,
		options?: ErrorOptions,
	) {
		super(`failed to resolve lexicon authority; nsid=${nsid}`, options);
	}
}

export class InvalidResolvedAuthorityError extends LexiconAuthorityResolutionError {
	override name = 'InvalidResolvedAuthorityError';

	constructor(
		public nsid: Nsid,
		public did: string,
	) {
		super(`lexicon authority returned invalid did; nsid=${nsid}; did=${did}`);
	}
}

export class AmbiguousAuthorityError extends LexiconAuthorityResolutionError {
	override name = 'AmbiguousAuthorityError';

	constructor(public nsid: Nsid) {
		super(`lexicon authority returned multiple did values; nsid=${nsid}`);
	}
}
// #endregion

// #region Lexicon resolution errors
export class LexiconResolutionError extends Error {
	override name = 'LexiconResolutionError';
}


export class FailedLexiconResolutionError extends LexiconResolutionError {
	override name = 'FailedLexiconResolutionError';

	constructor(
		public nsid: Nsid,
		options?: ErrorOptions,
	) {
		super(`failed to resolve lexicon; nsid=${nsid}`, options);
	}
}

export class InvalidLexiconSchemaError extends LexiconResolutionError {
	override name = 'InvalidLexiconSchemaError';

	constructor(
		public nsid: Nsid,
		options?: ErrorOptions,
	) {
		super(`invalid lexicon schema; nsid=${nsid}`, options);
	}
}

export class InvalidLexiconProofError extends LexiconResolutionError {
	override name = 'InvalidLexiconProofError';

	constructor(
		public nsid: Nsid,
		options?: ErrorOptions,
	) {
		super(`invalid lexicon record proof; nsid=${nsid}`, options);
	}
}
// #endregion
