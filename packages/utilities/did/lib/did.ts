import type { Did } from './types.js';

import { isDidPlc } from './methods/plc.js';
import { isAtprotoDidWeb } from './methods/web.js';

export const DID_RE = /^did:([a-z]+):([a-zA-Z0-9._:%\-]*[a-zA-Z0-9._\-])$/;

/**
 * checks if it's a DID identifier
 */
export const isDid = (input: string): input is Did => {
	return input.length >= 7 && DID_RE.test(input);
};

/**
 * checks if it's a DID identifier that is supported by atproto
 */
export const isAtprotoDid = (input: string): input is Did<'plc' | 'web'> => {
	return isDidPlc(input) || isAtprotoDidWeb(input);
};
