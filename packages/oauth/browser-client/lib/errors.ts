import type { Did } from '@atcute/lexicons';

export class LoginError extends Error {
	override name = 'LoginError';
}

export class AuthorizationError extends Error {
	override name = 'AuthorizationError';
}

export class ResolverError extends Error {
	override name = 'ResolverError';
}

export class TokenRefreshError extends Error {
	override name = 'TokenRefreshError';

	readonly sub: Did;

	constructor(sub: Did, message: string, options?: ErrorOptions) {
		super(message, options);
		this.sub = sub;
	}
}

export class OAuthResponseError extends Error {
	override name = 'OAuthResponseError';

	readonly response: Response;
	// oxlint-disable-next-line typescript/no-explicit-any
	readonly data: any;
	readonly error: string | undefined;
	readonly description: string | undefined;

	// oxlint-disable-next-line typescript/no-explicit-any
	constructor(response: Response, data: any) {
		const error = ifString(ifObject(data)?.['error']);
		const errorDescription = ifString(ifObject(data)?.['error_description']);

		const messageError = error ? `"${error}"` : 'unknown';
		const messageDesc = errorDescription ? `: ${errorDescription}` : '';
		const message = `OAuth ${messageError} error${messageDesc}`;

		super(message);

		this.response = response;
		this.data = data;
		this.error = error;
		this.description = errorDescription;
	}

	get status() {
		return this.response.status;
	}

	get headers() {
		return this.response.headers;
	}
}

export class FetchResponseError extends Error {
	override name = 'FetchResponseError';

	readonly response: Response;
	status: number;

	constructor(response: Response, status: number, message: string) {
		super(message);
		this.response = response;
		this.status = status;
	}
}

const ifString = (v: unknown): string | undefined => {
	return typeof v === 'string' ? v : undefined;
};
const ifObject = (v: unknown): Record<string, unknown> | undefined => {
	// oxlint-disable-next-line typescript/no-explicit-any
	return typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as any) : undefined;
};
