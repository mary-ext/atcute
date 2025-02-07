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

export class DocumentNotFoundError extends DidDocumentResolutionError {
	override name = 'DocumentNotFoundError';

	constructor(public did: Did) {
		super(`did document not found; did=${did}`);
	}
}

export class FailedDocumentResolutionError extends DidDocumentResolutionError {
	override name = 'FailedDocumentResolutionError';

	constructor(
		public did: Did,
		options?: ErrorOptions,
	) {
		super(`failed to resolve did document; did=${did}`, options);
	}
}
// #endregion

// #region Handle resolution errors
export class HandleResolutionError extends Error {
	override name = 'HandleResolutionError';
}

export class DidNotFoundError extends HandleResolutionError {
	override name = 'DidNotFoundError';

	constructor(public handle: string) {
		super(`handle returned no did; handle=${handle}`);
	}
}

export class FailedHandleResolutionError extends HandleResolutionError {
	override name = 'FailedHandleResolutionError';

	constructor(
		public handle: string,
		options?: ErrorOptions,
	) {
		super(`failed to resolve handle; handle=${handle}`, options);
	}
}

export class InvalidResolvedHandleError extends HandleResolutionError {
	override name = 'InvalidResolvedHandleError';

	constructor(
		public handle: string,
		public did: string,
	) {
		super(`handle returned invalid did; handle=${handle}; did=${did}`);
	}
}

export class AmbiguousHandleError extends HandleResolutionError {
	override name = 'AmbiguousHandleError';

	constructor(handle: string) {
		super(`handle returned multiple did values; handle=${handle}`);
	}
}
// #endregion
