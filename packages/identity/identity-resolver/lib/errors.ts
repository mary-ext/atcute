import type { Did } from '@atcute/identity';

// #region DID document resolution errors
export class DidDocumentResolutionError extends Error {
	override name = 'DidResolutionError';
}

export class UnsupportedDidMethodError extends DidDocumentResolutionError {
	override name = 'UnsupportedDidMethodError';

	constructor(public did: Did) {
		super(`unsupported did method; did=${did}`);
	}
}

export class ImproperDidError extends DidDocumentResolutionError {
	override name = 'ImproperDidError';

	constructor(public did: Did) {
		super(`improper did; did=${did}`);
	}
}
// #endregion

// #region Handle resolution errors
export class HandleResolutionError extends Error {
	override name = 'HandleResolutionError';
}

export class DidNotFoundError extends HandleResolutionError {
	override name = 'MissingDidError';

	constructor(public handle: string) {
		super(`handle returned no did; handle=${handle}`);
	}
}

export class FailedDidResolutionError extends HandleResolutionError {
	override name = 'FailedDidResolutionError';

	constructor(
		public handle: string,
		options?: ErrorOptions,
	) {
		super(`failed to resolve handle; handle=${handle}`, options);
	}
}

export class InvalidResolvedDidError extends HandleResolutionError {
	override name = 'InvalidResolvedDidError';

	constructor(
		public handle: string,
		public did: string,
	) {
		super(`handle returned invalid did; handle=${handle}; did=${did}`);
	}
}

export class DuplicateResolvedDidError extends HandleResolutionError {
	override name = 'DuplicateResolvedDidError';

	constructor(handle: string) {
		super(`handle returned multiple did values; handle=${handle}`);
	}
}
// #endregion
