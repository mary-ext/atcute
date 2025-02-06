export class FetchResponseError extends Error {
	override name = 'FetchResponseError';
}

export class FailedResponseError extends FetchResponseError {
	override name = 'FailedResponseError';

	constructor(
		public status: number,
		reason: string,
	) {
		super(reason);
	}
}

export class ImproperContentTypeError extends FetchResponseError {
	override name = 'ImproperContentTypeError';

	constructor(
		public contentType: string | null,
		reason: string,
	) {
		super(reason);
	}
}

export class ImproperContentLengthError extends FetchResponseError {
	override name = 'ImproperContentLengthError';

	constructor(
		public expectedSize: number,
		public actualSize: number | null,
		reason: string,
	) {
		super(reason);
	}
}

export class ImproperResponseError extends FetchResponseError {
	override name = 'ImproperResponseError';

	constructor(reason: string, options?: ErrorOptions) {
		super(reason, options);
	}
}
