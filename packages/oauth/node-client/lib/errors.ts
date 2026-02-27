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

	readonly sub: string;

	constructor(sub: string, message = `session for "${sub}" is invalid`, options?: ErrorOptions) {
		super(message, options);
		this.sub = sub;
	}
}

/**
 * thrown when token refresh fails.
 */
export class TokenRefreshError extends Error {
	override name = 'TokenRefreshError';

	readonly sub: string;

	constructor(sub: string, message: string, options?: ErrorOptions) {
		super(message, options);
		this.sub = sub;
	}
}

/**
 * thrown when a session has been revoked.
 */
export class TokenRevokedError extends Error {
	override name = 'TokenRevokedError';

	readonly sub: string;

	constructor(sub: string, message = `session for "${sub}" was revoked`, options?: ErrorOptions) {
		super(message, options);
		this.sub = sub;
	}
}

/**
 * thrown when OAuth response indicates an error.
 */
export class OAuthResponseError extends Error {
	override name = 'OAuthResponseError';

	readonly response: Response;
	readonly error: string;
	readonly errorDescription?: string;

	constructor(response: Response, error: string, errorDescription?: string) {
		super(errorDescription ?? error);
		this.response = response;
		this.error = error;
		this.errorDescription = errorDescription;
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

	readonly error: string;
	readonly errorDescription?: string;
	readonly state?: string;

	constructor(error: string, errorDescription?: string, state?: string) {
		super(errorDescription ?? error);
		this.error = error;
		this.errorDescription = errorDescription;
		this.state = state;
	}
}

/**
 * thrown when metadata resolution fails.
 */
export class OAuthResolverError extends Error {
	override name = 'OAuthResolverError';
}
