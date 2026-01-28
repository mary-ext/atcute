import { toBase64Url } from '@atcute/multibase';
import { encodeUtf8, toSha256 } from '@atcute/uint8array';

/**
 * computes sha-256 hash and returns base64url-encoded result.
 *
 * @param input string to hash
 * @returns base64url-encoded sha-256 hash
 */
export const sha256Base64Url = async (input: string): Promise<string> => {
	const bytes = encodeUtf8(input);
	const digest = await toSha256(bytes);
	return toBase64Url(digest);
};
