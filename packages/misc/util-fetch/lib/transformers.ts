import * as v from 'valibot';

import * as err from './errors.ts';
import { SizeLimitStream } from './streams/size-limit.ts';

export type TextResponse = {
	response: Response;
	text: string;
};

export type ParsedJsonResponse<T = unknown> = {
	response: Response;
	json: T;
};

export const isResponseOk = async (response: Response): Promise<Response> => {
	if (response.ok) {
		return response;
	}

	throw new err.FailedResponseError(response);
};

export const readResponseAsText =
	(maxSize: number) =>
	async (response: Response): Promise<TextResponse> => {
		const text = await readResponse(response, maxSize);
		return { response, text };
	};

export const parseResponseAsJson =
	(typeRegex: RegExp, maxSize: number) =>
	async (response: Response): Promise<ParsedJsonResponse> => {
		await assertContentType(response, typeRegex);

		const text = await readResponse(response, maxSize);

		try {
			const json = JSON.parse(text);
			return { response, json };
		} catch (error) {
			throw new err.ImproperResponseError(`unexpected json data`, { cause: error });
		}
	};

export const validateJsonWith =
	<TOutput>(schema: v.GenericSchema<unknown, TOutput>) =>
	async (parsed: ParsedJsonResponse): Promise<ParsedJsonResponse<TOutput>> => {
		const json = v.parse(schema, parsed.json);
		return { response: parsed.response, json };
	};

const assertContentType = async (response: Response, typeRegex: RegExp): Promise<void> => {
	const type = response.headers.get('content-type')?.split(';', 1)[0].trim();

	if (type === undefined) {
		if (response.body) {
			await response.body.cancel();
		}

		throw new err.ImproperContentTypeError(null, `missing response content-type`);
	}

	if (!typeRegex.test(type)) {
		if (response.body) {
			await response.body.cancel();
		}

		throw new err.ImproperContentTypeError(type, `unexpected response content-type`);
	}
};

const readResponse = async (response: Response, maxSize: number): Promise<string> => {
	const rawSize = response.headers.get('content-length');
	if (rawSize !== null) {
		const size = Number(rawSize);

		if (!Number.isSafeInteger(size) || size <= 0) {
			response.body?.cancel();
			throw new err.ImproperContentLengthError(maxSize, null, `invalid response content-length`);
		}

		if (size > maxSize) {
			response.body?.cancel();
			throw new err.ImproperContentLengthError(maxSize, size, `response content-length too large`);
		}
	}

	const stream = response
		.body!.pipeThrough(new SizeLimitStream(maxSize))
		.pipeThrough(new TextDecoderStream());

	let text = '';
	for await (const chunk of createStreamIterator(stream)) {
		text += chunk;
	}

	return text;
};

const createStreamIterator: <T>(stream: ReadableStream<T>) => AsyncIterableIterator<T> =
	Symbol.asyncIterator in ReadableStream.prototype
		? (stream) => stream[Symbol.asyncIterator]()
		: (stream) => {
				const reader = stream.getReader();

				return {
					[Symbol.asyncIterator]() {
						return this;
					},
					next() {
						return reader.read() as Promise<IteratorResult<any>>;
					},
					async return() {
						await reader.cancel();
						return { done: true, value: undefined };
					},
					async throw(error: unknown) {
						await reader.cancel(error);
						return { done: true, value: undefined };
					},
				};
			};
