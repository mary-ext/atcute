import { encode } from '@atcute/cbor';
import { concat } from '@atcute/uint8array';

interface MessageFrameHeader {
	op: 1;
	t?: string; // Type discriminator for union messages (relative to NSID)
}

interface ErrorFrameHeader {
	op: -1;
}

interface ErrorFrameBody {
	error: string;
	message?: string;
}

/** encodes outgoing subscription frames for a particular subprotocol */
export type FrameEncoder = {
	message: (message: unknown) => string | Uint8Array;
	error: (error: string, message?: string) => string | Uint8Array;
};

/**
 * resolves the frame encoder for a negotiated subprotocol; picked once per connection. the v0 encoder needs
 * the subscription's nsid to rewrite each message's $type into the relative header discriminator, which v1
 * frames instead carry inline on the payload.
 */
export const getFrameEncoder = (protocol: string, nsid: string): FrameEncoder => {
	switch (protocol) {
		case 'xrpc.v1.json': {
			return {
				message: (message) => JSON.stringify({ $type: 'message', payload: message }),
				error: (error, message) => JSON.stringify({ $type: 'error', error: error, message: message }),
			};
		}
		case 'xrpc.v1.cbor': {
			return {
				message: (message) => encode({ $type: 'message', payload: message }),
				error: (error, message) => encode({ $type: 'error', error: error, message: message }),
			};
		}
		default: {
			return {
				message: (message) => encodeV0MessageFrame(message, nsid),
				error: (error, message) => encodeV0ErrorFrame(error, message),
			};
		}
	}
};

/** encodes a legacy v0 message frame: a header carrying the relative $type discriminator, then the body */
const encodeV0MessageFrame = (message: unknown, nsid: string): Uint8Array => {
	const header: MessageFrameHeader = {
		op: 1,
		t: extractMessageType(message, nsid),
	};

	return concat([encode(header), encode(omitMessageType(message))]);
};

/** encodes a legacy v0 error frame */
const encodeV0ErrorFrame = (error: string, message?: string): Uint8Array => {
	const header: ErrorFrameHeader = {
		op: -1,
	};

	const body: ErrorFrameBody = {
		error: error,
		message: message,
	};

	return concat([encode(header), encode(body)]);
};

const extractMessageType = (message: unknown, nsid: string): string | undefined => {
	if (typeof message !== 'object' || message === null) {
		return undefined;
	}

	const obj = message as Record<string, unknown>;
	const type = obj.$type;

	if (typeof type !== 'string') {
		return undefined;
	}

	// If type starts with the subscription NSID, make it relative
	// e.g., "com.atproto.sync.subscribeRepos#commit" → "#commit"
	if (type.startsWith(nsid + '#')) {
		return type.slice(nsid.length);
	}

	// Otherwise return the full type
	return type;
};

const omitMessageType = (message: unknown): unknown => {
	if (typeof message !== 'object' || message === null) {
		return message;
	}

	const obj = message as Record<string, unknown>;
	const { $type: _type, ...rest } = obj;

	return rest;
};
