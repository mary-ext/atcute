import type { Did } from '@atcute/identity';

export class DidResolutionError extends Error {
	override name = 'DidResolutionError';
}

export class UnsupportedDidMethodError extends DidResolutionError {
	override name = 'UnsupportedDidMethodError';

	constructor(public did: Did) {
		super(`unsupported did method; did=${did}`);
	}
}

export class ImproperDidError extends DidResolutionError {
	override name = 'ImproperDidError';

	constructor(public did: Did) {
		super(`improper did; did=${did}`);
	}
}

export class HandleResolutionError extends Error {
	override name = 'HandleResolutionError';
}

export class MissingDidError extends HandleResolutionError {
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
