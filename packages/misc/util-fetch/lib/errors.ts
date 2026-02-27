export class FetchResponseError extends Error {
	override name = 'FetchResponseError';
}

export class FailedResponseError extends FetchResponseError {
	override name = 'FailedResponseError';

	response: Response;

	constructor(response: Response) {
		super(`got http ${response.status}`);
		this.response = response;
	}

	get status(): number {
		return this.response.status;
	}
}

export class ImproperContentTypeError extends FetchResponseError {
	override name = 'ImproperContentTypeError';

	contentType: string | null;

	constructor(contentType: string | null, reason: string) {
		super(reason);
		this.contentType = contentType;
	}
}

export class ImproperContentLengthError extends FetchResponseError {
	override name = 'ImproperContentLengthError';

	expectedSize: number;
	actualSize: number | null;

	constructor(expectedSize: number, actualSize: number | null, reason: string) {
		super(reason);
		this.expectedSize = expectedSize;
		this.actualSize = actualSize;
	}
}

export class ImproperResponseError extends FetchResponseError {
	override name = 'ImproperResponseError';
}
