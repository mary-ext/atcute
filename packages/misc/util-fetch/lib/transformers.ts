import * as v from 'valibot';

import * as err from './errors.ts';
import { SizeLimitStream } from './streams/size-limit.ts';

export type BytesResponse = {
	response: Response;
	bytes: Uint8Array;
};

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

/**
 * create a size-limited response body reader.
 *
 * @param maxSize maximum body size in bytes
 * @returns a reader yielding the original response and its body as a `Uint8Array`
 * @throws {err.ImproperContentLengthError} if content-length is invalid or the body exceeds `maxSize`
 */
export const readResponseAsBytes =
	(maxSize: number) =>
	async (response: Response): Promise<BytesResponse> => {
		const bytes = await readResponseBytes(response, maxSize);
		return { response, bytes };
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
	// media types are case-insensitive (RFC 9110 §8.3.1)
	const type = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();

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

const assertContentLength = (response: Response, maxSize: number): void => {
	const rawSize = response.headers.get('content-length');
	if (rawSize !== null) {
		const size = Number(rawSize);

		// content-length is `1*DIGIT` (RFC 9110 §8.6); `0` is valid (empty body)
		if (!/^\d+$/.test(rawSize) || !Number.isSafeInteger(size)) {
			response.body?.cancel();
			throw new err.ImproperContentLengthError(maxSize, null, `invalid response content-length`);
		}

		if (size > maxSize) {
			response.body?.cancel();
			throw new err.ImproperContentLengthError(maxSize, size, `response content-length too large`);
		}
	}
};

const readResponseBytes = async (response: Response, maxSize: number): Promise<Uint8Array> => {
	assertContentLength(response, maxSize);

	if (response.body === null) {
		return new Uint8Array(0);
	}

	const stream = response.body.pipeThrough(new SizeLimitStream(maxSize));

	const chunks: Uint8Array[] = [];
	let size = 0;
	for await (const chunk of createStreamIterator(stream)) {
		chunks.push(chunk);
		size += chunk.length;
	}

	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.length;
	}

	return bytes;
};

const readResponse = async (response: Response, maxSize: number): Promise<string> => {
	assertContentLength(response, maxSize);

	if (response.body === null) {
		return '';
	}

	const stream = response.body.pipeThrough(new SizeLimitStream(maxSize)).pipeThrough(new TextDecoderStream());

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
						// oxlint-disable-next-line typescript/no-explicit-any
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
