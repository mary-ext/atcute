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

/**
 * returns the DID's method
 */
export const extractDidMethod = <M extends string>(did: Did<M>): M => {
	const isep = did.indexOf(':', 4);
	const method = did.slice(4, isep);
	return method as M;
};
