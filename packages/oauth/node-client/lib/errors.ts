/**
 * thrown when client authentication method is no longer usable
 * (e.g., key removed from keyset or server no longer supports method).
 */
export class AuthMethodUnsatisfiableError extends Error {
	override name = 'AuthMethodUnsatisfiableError';
}

/**
 * thrown when a session is invalid and cannot be used.
 */
export class TokenInvalidError extends Error {
	override name = 'TokenInvalidError';

	constructor(
		public readonly sub: string,
		message = `session for "${sub}" is invalid`,
		options?: ErrorOptions,
	) {
		super(message, options);
	}
}

/**
 * thrown when token refresh fails.
 */
export class TokenRefreshError extends Error {
	override name = 'TokenRefreshError';

	constructor(
		public readonly sub: string,
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
	}
}

/**
 * thrown when a session has been revoked.
 */
export class TokenRevokedError extends Error {
	override name = 'TokenRevokedError';

	constructor(
		public readonly sub: string,
		message = `session for "${sub}" was revoked`,
		options?: ErrorOptions,
	) {
		super(message, options);
	}
}

/**
 * thrown when OAuth response indicates an error.
 */
export class OAuthResponseError extends Error {
	override name = 'OAuthResponseError';

	constructor(
		public readonly response: Response,
		public readonly error: string,
		public readonly errorDescription?: string,
	) {
		super(errorDescription ?? error);
	}

	get status(): number {
		return this.response.status;
	}
}

/**
 * thrown when OAuth callback contains an error.
 */
export class OAuthCallbackError extends Error {
	override name = 'OAuthCallbackError';

	constructor(
		public readonly error: string,
		public readonly errorDescription?: string,
		public readonly state?: string,
	) {
		super(errorDescription ?? error);
	}
}

/**
 * thrown when metadata resolution fails.
 */
export class OAuthResolverError extends Error {
	override name = 'OAuthResolverError';
}
