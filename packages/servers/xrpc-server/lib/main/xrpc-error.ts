export interface XRPCErrorOptions {
	status: number;
	error: string;
	description?: string;
	headers?: HeadersInit;
}

export class XRPCError extends Error {
	/** response status */
	readonly status: number;

	/** error name */
	readonly error: string;
	/** error message */
	readonly description?: string;
	/** response headers */
	readonly headers?: HeadersInit;

	constructor({ status, error, description, headers }: XRPCErrorOptions) {
		super(`${error} > ${description ?? '(unspecified description)'}`);

		this.status = status;

		this.error = error;
		this.description = description;
		this.headers = headers;
	}

	toResponse(): Response {
		return Response.json(
			{ error: this.error, message: this.description },
			{ status: this.status, headers: this.headers },
		);
	}
}

export class InvalidRequestError extends XRPCError {
	constructor({
		status = 400,
		error = 'InvalidRequest',
		description,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, description, headers });
	}
}

export class AuthRequiredError extends XRPCError {
	constructor({
		status = 401,
		error = 'AuthenticationRequired',
		description,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, description, headers });
	}
}

export class ForbiddenError extends XRPCError {
	constructor({ status = 403, error = 'Forbidden', description, headers }: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, description, headers });
	}
}

export class RateLimitExceededError extends XRPCError {
	constructor({
		status = 429,
		error = 'RateLimitExceeded',
		description,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, description, headers });
	}
}

export class InternalServerError extends XRPCError {
	constructor({
		status = 500,
		error = 'InternalServerError',
		description,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, description, headers });
	}
}

export class UpstreamFailureError extends XRPCError {
	constructor({
		status = 502,
		error = 'UpstreamFailure',
		description,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, description, headers });
	}
}

export class NotEnoughResourcesError extends XRPCError {
	constructor({
		status = 503,
		error = 'NotEnoughResources',
		description,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, description, headers });
	}
}

export class UpstreamTimeoutError extends XRPCError {
	constructor({
		status = 504,
		error = 'UpstreamTimeout',
		description,
		headers,
	}: Partial<XRPCErrorOptions> = {}) {
		super({ status, error, description, headers });
	}
}

export interface XRPCSubscriptionErrorOptions {
	closeCode?: number;
	error: string;
	description?: string;
}

export class XRPCSubscriptionError extends Error {
	readonly closeCode: number;
	readonly error: string;
	readonly description?: string;

	constructor({ closeCode = 1008, error, description }: XRPCSubscriptionErrorOptions) {
		super(`Subscription error: ${error}${description ? ` - ${description}` : ''}`);

		this.closeCode = closeCode;
		this.error = error;
		this.description = description;
	}
}
