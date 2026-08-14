import { decode, decodeFirst } from '@atcute/cbor';
import type { XRPCSubprotocol } from '@atcute/lexicons/validations';

import type { DecodedFrame, ErrorFrameBody, FrameHeader } from './types.ts';

/** XRPC subscription frame decoder */
export type FrameDecoder = (data: unknown) => DecodedFrame;

export interface FrameDecoderOptions {
	/** used to expand relative v0 discriminators */
	nsid: string;

	/** frame format */
	subprotocol: XRPCSubprotocol;
}

/**
 * creates an XRPC subscription frame decoder
 *
 * @param options subscription and frame format
 * @returns a decoder for the frame format
 * @throws {Error} when the subprotocol is unsupported
 */
export const createFrameDecoder = ({ nsid, subprotocol }: FrameDecoderOptions): FrameDecoder => {
	switch (subprotocol) {
		case 'xrpc.v0.cbor': {
			return (data) => decodeV0CborFrame(data, nsid);
		}
		case 'xrpc.v1.cbor': {
			return decodeV1CborFrame;
		}
		case 'xrpc.v1.json': {
			return decodeV1JsonFrame;
		}
		default: {
			throw new Error(`unsupported XRPC subscription subprotocol: ${subprotocol}`);
		}
	}
};

const decodeV0CborFrame = (data: unknown, nsid: string): DecodedFrame => {
	const [header, afterHeader] = decodeFirst(toUint8Array(data));

	if (!isValidHeader(header)) {
		throw new Error(`invalid v0 frame header`);
	}

	const body = decode(afterHeader);

	if (header.op === 1) {
		if (body === null || typeof body !== 'object') {
			throw new Error(`invalid v0 message frame`);
		}

		const type = header.t;
		if (type !== undefined) {
			(body as Record<string, unknown>).$type = type[0] === '#' ? nsid + type : type;
		}

		return {
			type: 'message',
			body,
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

const decodeV1CborFrame: FrameDecoder = (data) => {
	return decodeV1Envelope(decode(toUint8Array(data)));
};

const decodeV1JsonFrame: FrameDecoder = (data) => {
	if (typeof data !== 'string') {
		throw new TypeError(`expected a text websocket message`);
	}

	return decodeV1Envelope(JSON.parse(data));
};

const decodeV1Envelope = (value: unknown): DecodedFrame => {
	if (value === null || typeof value !== 'object') {
		throw new Error(`invalid v1 frame`);
	}

	const frame = value as Record<string, unknown>;

	switch (frame.$type) {
		case 'error': {
			if (
				typeof frame.error !== 'string' ||
				(frame.message !== undefined && typeof frame.message !== 'string')
			) {
				throw new Error(`invalid v1 error frame`);
			}

			return {
				type: 'error',
				error: frame.error,
				message: frame.message,
			};
		}
		case 'message': {
			const payload = frame.payload;

			if (payload === null || typeof payload !== 'object') {
				throw new Error(`invalid v1 message frame`);
			}

			return {
				type: 'message',
				body: payload,
			};
		}
		default: {
			throw new Error(`invalid v1 frame type`);
		}
	}
};

const toUint8Array = (data: unknown): Uint8Array => {
	if (data instanceof ArrayBuffer) {
		return new Uint8Array(data);
	}

	if (ArrayBuffer.isView(data)) {
		return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
	}

	throw new TypeError(`expected a binary websocket message`);
};

const isValidHeader = (value: unknown): value is FrameHeader => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (obj.op === 1 || obj.op === -1) && (obj.t === undefined || typeof obj.t === 'string');
};
