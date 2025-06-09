import type { Did } from '@atcute/lexicons';

const KEY_DID_RE = /^did:key:z[a-km-zA-HJ-NP-Z1-9]+$/;

/**
 * checks if input is a did:key identifier
 */
export const isKeyDid = (input: string): input is Did<'key'> => {
	return input.length >= 10 && KEY_DID_RE.test(input);
};
