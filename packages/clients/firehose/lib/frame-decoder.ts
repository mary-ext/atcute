import { decode, decodeFirst } from '@atcute/cbor';

import type { DecodedFrame, ErrorFrameBody, FrameHeader } from './types.ts';

/** a function that decodes a WebSocket message into a frame */
export type FrameDecoder = (data: ArrayBuffer | string) => DecodedFrame;

/**
 * resolves the frame decoder for a negotiated subprotocol; picked once per connection. the v0 decoder needs
 * the subscription's nsid to reconstruct each message's `$type` from the header discriminator, which v1
 * frames instead carry inline.
 */
export const getFrameDecoder = (protocol: string, nsid: string): FrameDecoder => {
	switch (protocol) {
		case 'xrpc.v1.json': {
			return (data) => decodeV1Frame(JSON.parse(data as string));
		}
		case 'xrpc.v1.cbor': {
			return (data) => decodeV1Frame(decode(new Uint8Array(data as ArrayBuffer)));
		}
		default: {
			return (data) => decodeV0Frame(new Uint8Array(data as ArrayBuffer), nsid);
		}
	}
};

/** decodes a legacy v0 frame: two concatenated CBOR objects, a header followed by a body */
export const decodeV0Frame = (buffer: Uint8Array, nsid: string): DecodedFrame => {
	const [header, afterHeader] = decodeFirst(buffer);

	if (!isValidHeader(header)) {
		throw new Error('invalid frame header');
	}

	const body = decode(afterHeader);

	if (header.op === 1) {
		// v0 carries the message's $type as a relative discriminator in the header; reconstruct it onto the body
		addTypeToBody(body, header.t, nsid);

		return {
			type: 'message',
			body: body,
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
 * decodes a v1 frame: a single self-describing object discriminated by its `$type` field. shared by the
 * `xrpc.v1.json` and `xrpc.v1.cbor` subprotocols, which differ only in how that object is serialized.
 */
export const decodeV1Frame = (value: unknown): DecodedFrame => {
	if (value === null || typeof value !== 'object') {
		throw new Error('invalid frame');
	}

	const obj = value as Record<string, unknown>;
	const type = obj.$type;

	switch (type) {
		case 'message': {
			// the payload already carries its full `<nsid>#<fragment>` $type, so no discriminator is needed
			return {
				type: 'message',
				body: obj.payload,
			};
		}
		case 'error': {
			const error = obj.error;
			const message = obj.message;

			if (typeof error !== 'string' || (message !== undefined && typeof message !== 'string')) {
				throw new Error('invalid error frame');
			}

			return {
				type: 'error',
				error: error,
				message: message,
			};
		}
		default: {
			throw new Error('unknown frame type');
		}
	}
};

/** type guard for frame header */
const isValidHeader = (value: unknown): value is FrameHeader => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (obj.op === 1 || obj.op === -1) && (obj.t === undefined || typeof obj.t === 'string');
};

/** reconstructs the full $type field from a relative discriminator and the subscription nsid */
const reconstructType = (discriminator: string | undefined, nsid: string): string | undefined => {
	if (!discriminator) {
		return undefined;
	}

	if (discriminator[0] === '#') {
		return nsid + discriminator;
	}

	return discriminator;
};

/** sets the reconstructed $type field on a message body when a discriminator is present */
const addTypeToBody = (body: unknown, discriminator: string | undefined, nsid: string): void => {
	const type = reconstructType(discriminator, nsid);

	if (type && typeof body === 'object' && body !== null) {
		(body as Record<string, unknown>).$type = type;
	}
};
