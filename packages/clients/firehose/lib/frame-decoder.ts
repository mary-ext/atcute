import { decode, decodeFirst } from '@atcute/cbor';

import type { DecodedFrame, ErrorFrameBody, FrameHeader } from './types.ts';

/**
 * decodes a CBOR frame from a buffer
 */
export const decodeFrame = (buffer: Uint8Array): DecodedFrame => {
	const [header, afterHeader] = decodeFirst(buffer);

	if (!isValidHeader(header)) {
		throw new Error('invalid frame header');
	}

	const body = decode(afterHeader);

	if (header.op === 1) {
		return {
			type: 'message',
			body,
			discriminator: header.t,
		};
	} else {
		const errorBody = body as ErrorFrameBody;
		return {
			type: 'error',
			error: errorBody.error,
			message: errorBody.message,
		};
	}
};

/**
 * type guard for frame header
 */
const isValidHeader = (value: unknown): value is FrameHeader => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (obj.op === 1 || obj.op === -1) && (obj.t === undefined || typeof obj.t === 'string');
};

/**
 * reconstructs full $type field from discriminator and nsid
 */
export const reconstructType = (discriminator: string | undefined, nsid: string): string | undefined => {
	if (!discriminator) {
		return undefined;
	}

	if (discriminator[0] === '#') {
		return nsid + discriminator;
	}

	return discriminator;
};

/**
 * adds $type field to message body if discriminator is present
 */
export const addTypeToBody = (body: unknown, discriminator: string | undefined, nsid: string): unknown => {
	const type = reconstructType(discriminator, nsid);

	if (type && typeof body === 'object' && body !== null) {
		(body as Record<string, unknown>).$type = type;
	}

	return body;
};
