import { encodeUtf8 } from '@atcute/uint8array';

/**
 * encodes a key as UTF-8
 *
 * @param key the key to encode
 * @returns the encoded key
 */
export const encodeKey = (key: string): Uint8Array<ArrayBuffer> => {
	// valid MST keys are ASCII; copy directly to avoid TextEncoder overhead
	const len = key.length;
	const bytes = new Uint8Array(len);

	for (let idx = 0; idx < len; idx++) {
		const code = key.charCodeAt(idx);
		if (code > 0x7f) {
			return encodeUtf8(key);
		}

		bytes[idx] = code;
	}

	return bytes;
};
