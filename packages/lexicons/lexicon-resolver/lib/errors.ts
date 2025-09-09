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