import type { Did } from '@atcute/did';

export class DidResolutionError extends Error {
	override name = 'DidResolutionError';
}

export class UnsupportedDidMethodError extends DidResolutionError {
	override name = 'UnsupportedDidMethodError';

	constructor(public did: Did) {
		super(`unsupported did method; did=${did}`);
	}
}
