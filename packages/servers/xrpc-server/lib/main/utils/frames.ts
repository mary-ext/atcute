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

export const encodeMessageFrame = (body: unknown, type?: string): Uint8Array => {
	const header: MessageFrameHeader = {
		op: 1,
		t: type,
	};

	return concat([encode(header), encode(body)]);
};

export const encodeErrorFrame = (error: string, message?: string): Uint8Array => {
	const header: ErrorFrameHeader = {
		op: -1,
	};

	const body: ErrorFrameBody = {
		error: error,
		message: message,
	};

	return concat([encode(header), encode(body)]);
};

export const extractMessageType = (message: unknown, nsid: string): string | undefined => {
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

export const omitMessageType = (message: unknown): unknown => {
	if (typeof message !== 'object' || message === null) {
		return message;
	}

	const obj = message as Record<string, unknown>;
	const { $type, ...rest } = obj;

	return rest;
};
