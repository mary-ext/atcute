/**
 * a single WWW-Authenticate challenge. exactly one of `params` or `token68` may
 * be provided. a bare scheme (no params, no token) is valid and renders as just
 * the scheme name.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7235#section-4.1 | RFC 7235 §4.1}
 */
export interface WWWAuthenticateChallenge {
	/** authentication scheme, e.g. `Bearer`, `DPoP`, `Basic`. */
	scheme: string;
	/** auth-param pairs. entries whose value is `undefined` are omitted. */
	params?: Record<string, string | undefined>;
	/**
	 * token68 value for schemes that carry one instead of auth-params (e.g.
	 * `Basic`). mutually exclusive with `params`.
	 */
	token68?: string;
}

/**
 * formats one or more WWW-Authenticate challenges into a single header value.
 *
 * each challenge is emitted as `<scheme>` followed by its params or token68.
 * multiple challenges are joined with `, `. auth-param values are quoted using
 * `JSON.stringify` (RFC 7230 quoted-string semantics for ASCII content).
 *
 * @param challenges one challenge, or an ordered array of challenges
 * @returns the formatted header value
 *
 * @example
 * ```ts
 * formatWWWAuthenticate({ scheme: 'Bearer', params: { error: 'BadJwtSignature' } })
 * // => `Bearer error="BadJwtSignature"`
 * ```
 */
export const formatWWWAuthenticate = (
	challenges: WWWAuthenticateChallenge | WWWAuthenticateChallenge[],
): string => {
	const list = Array.isArray(challenges) ? challenges : [challenges];
	return list.map(formatChallenge).join(', ');
};

const formatChallenge = (challenge: WWWAuthenticateChallenge): string => {
	if (challenge.token68 !== undefined) {
		return `${challenge.scheme} ${challenge.token68}`;
	}

	if (challenge.params !== undefined) {
		const parts: string[] = [];
		for (const name in challenge.params) {
			const value = challenge.params[name];
			if (value !== undefined) {
				parts.push(`${name}=${JSON.stringify(value)}`);
			}
		}

		if (parts.length > 0) {
			return `${challenge.scheme} ${parts.join(', ')}`;
		}
	}

	return challenge.scheme;
};

export interface XRPCErrorOptions {
	status: number;
	error: string;
	message?: string;
	headers?: HeadersInit;
}

export class XRPCError extends Error {
	/** response status */
	readonly status: number;

	/** error name */
	readonly error: string;
	/** response headers */
	readonly headers?: HeadersInit;

	constructor({ status, error, message, headers }: XRPCErrorOptions) {
		super(message);

		this.status = status;

		this.error = error;
		this.headers = headers;
	}

	toResponse(): Response {
		return Response.json(
			{ error: this.error, message: this.message || undefined },
			{ status: this.status, headers: this.headers },
		);
	}
}

export class InvalidRequestError extends XRPCError {
	constructor({ status = 400, error = 'InvalidRequest', message, headers }: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, message, headers });
	}
}

export interface AuthRequiredErrorOptions extends Partial<XRPCErrorOptions> {
	/**
	 * WWW-Authenticate challenge(s) to attach to the response. the formatted
	 * header is set on `headers` automatically, and `access-control-expose-headers`
	 * is appended so browsers can read it from CORS responses.
	 */
	wwwAuthenticate?: WWWAuthenticateChallenge | WWWAuthenticateChallenge[];
}

export class AuthRequiredError extends XRPCError {
	constructor({
		status = 401,
		error = 'AuthenticationRequired',
		message,
		headers,
		wwwAuthenticate,
	}: AuthRequiredErrorOptions = {}) {
		let mergedHeaders = headers;

		if (wwwAuthenticate !== undefined) {
			const target = new Headers(headers);
			target.set('www-authenticate', formatWWWAuthenticate(wwwAuthenticate));
			target.append('access-control-expose-headers', 'www-authenticate');
			mergedHeaders = target;
		}

		super({ status, error, message, headers: mergedHeaders });
	}
}

export class ForbiddenError extends XRPCError {
	constructor({ status = 403, error = 'Forbidden', message, headers }: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, message, headers });
	}
}

export class RateLimitExceededError extends XRPCError {
	constructor({
		status = 429,
		error = 'RateLimitExceeded',
		message,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, message, headers });
	}
}

export class InternalServerError extends XRPCError {
	constructor({
		status = 500,
		error = 'InternalServerError',
		message,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, message, headers });
	}
}

export class UpstreamFailureError extends XRPCError {
	constructor({ status = 502, error = 'UpstreamFailure', message, headers }: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, message, headers });
	}
}

export class NotEnoughResourcesError extends XRPCError {
	constructor({
		status = 503,
		error = 'NotEnoughResources',
		message,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, message, headers });
	}
}

export class UpstreamTimeoutError extends XRPCError {
	constructor({ status = 504, error = 'UpstreamTimeout', message, headers }: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, message, headers });
	}
}

export interface XRPCSubscriptionErrorOptions {
	closeCode?: number;
	error: string;
	message?: string;
}

export class XRPCSubscriptionError extends Error {
	readonly closeCode: number;
	readonly error: string;

	constructor({ closeCode = 1008, error, message }: XRPCSubscriptionErrorOptions) {
		super(message);

		this.closeCode = closeCode;
		this.error = error;
	}
}
