import type { Did } from '@atcute/lexicons/syntax';

// #region DID document resolution errors
export class DidDocumentResolutionError extends Error {
	override name = 'DidResolutionError';
}

export class UnsupportedDidMethodError extends DidDocumentResolutionError {
	override name = 'UnsupportedDidMethodError';

	did: Did;

	constructor(did: Did) {
		super(`unsupported did method; did=${did}`);
		this.did = did;
	}
}

export class ImproperDidError extends DidDocumentResolutionError {
	override name = 'ImproperDidError';

	did: Did;

	constructor(did: Did) {
		super(`improper did; did=${did}`);
		this.did = did;
	}
}

export class DocumentNotFoundError extends DidDocumentResolutionError {
	override name = 'DocumentNotFoundError';

	did: Did;

	constructor(did: Did) {
		super(`did document not found; did=${did}`);
		this.did = did;
	}
}

export class FailedDocumentResolutionError extends DidDocumentResolutionError {
	override name = 'FailedDocumentResolutionError';

	did: Did;

	constructor(did: Did, options?: ErrorOptions) {
		super(`failed to resolve did document; did=${did}`, options);
		this.did = did;
	}
}
// #endregion

// #region Handle resolution errors
export class HandleResolutionError extends Error {
	override name = 'HandleResolutionError';
}

export class DidNotFoundError extends HandleResolutionError {
	override name = 'DidNotFoundError';

	handle: string;

	constructor(handle: string) {
		super(`handle returned no did; handle=${handle}`);
		this.handle = handle;
	}
}

export class FailedHandleResolutionError extends HandleResolutionError {
	override name = 'FailedHandleResolutionError';

	handle: string;

	constructor(handle: string, options?: ErrorOptions) {
		super(`failed to resolve handle; handle=${handle}`, options);
		this.handle = handle;
	}
}

export class InvalidResolvedHandleError extends HandleResolutionError {
	override name = 'InvalidResolvedHandleError';

	handle: string;
	did: string;

	constructor(handle: string, did: string) {
		super(`handle returned invalid did; handle=${handle}; did=${did}`);
		this.handle = handle;
		this.did = did;
	}
}

export class AmbiguousHandleError extends HandleResolutionError {
	override name = 'AmbiguousHandleError';

	constructor(handle: string) {
		super(`handle returned multiple did values; handle=${handle}`);
	}
}
// #endregion

// #region Actor resolution errors
export class ActorResolutionError extends Error {
	override name = 'ActorResolutionError';
}
// #endregion
