import { toBase64Url } from '@atcute/multibase';
import { toSha256 } from '@atcute/uint8array';

export const encoder = new TextEncoder();

export const locks: LockManager | undefined = typeof navigator !== 'undefined' ? navigator.locks : undefined;

export const stringToSha256 = async (input: string): Promise<string> => {
	const bytes = encoder.encode(input);
	const digest = await toSha256(bytes);

	return toBase64Url(new Uint8Array(digest));
};

export const randomBytes = (length: number): string => {
	return toBase64Url(crypto.getRandomValues(new Uint8Array(length)));
};

export const generateState = (): string => {
	return randomBytes(16);
};

export const generatePKCE = async (): Promise<{ verifier: string; challenge: string; method: string }> => {
	const verifier = randomBytes(32);

	return {
		verifier: verifier,
		challenge: await stringToSha256(verifier),
		method: 'S256',
	};
};

let lastTimestamp = 0;
let randomString: string | undefined;
export const generateJti = (): string => {
	if (randomString === undefined) {
		const random = crypto.getRandomValues(new BigUint64Array(1));
		randomString = random[0].toString(36);
	}

	const timestamp = Math.max(Date.now() * 1_000, lastTimestamp);
	lastTimestamp = timestamp + 1;

	return `${timestamp.toString(36)}:${randomString}`;
};
