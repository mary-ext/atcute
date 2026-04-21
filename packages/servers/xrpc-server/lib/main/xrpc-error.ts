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

export class AuthRequiredError extends XRPCError {
	constructor({
		status = 401,
		error = 'AuthenticationRequired',
		message,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, message, headers });
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
