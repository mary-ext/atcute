import { nanoid } from 'nanoid';

import { toBase64Url } from '@atcute/multibase';
import { encodeUtf8, toSha256 } from '@atcute/uint8array';

export const locks: LockManager | undefined = typeof navigator !== 'undefined' ? navigator.locks : undefined;

export const stringToSha256 = async (input: string): Promise<string> => {
	const bytes = encodeUtf8(input);
	const digest = await toSha256(bytes);

	return toBase64Url(digest);
};

export const generatePKCE = async (): Promise<{ verifier: string; challenge: string; method: string }> => {
	const verifier = nanoid(64);

	return {
		verifier: verifier,
		challenge: await stringToSha256(verifier),
		method: 'S256',
	};
};
