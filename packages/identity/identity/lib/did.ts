import type { AtprotoDid, Did } from '@atcute/lexicons/syntax';

import { isPlcDid } from './methods/plc.js';
import { isAtprotoWebDid } from './methods/web.js';

/**
 * checks if it's a DID identifier that is supported by atproto
 */
export const isAtprotoDid = (input: string): input is AtprotoDid => {
	return isPlcDid(input) || isAtprotoWebDid(input);
};

/**
 * returns the DID's method
 */
export const extractDidMethod = <M extends string>(did: Did<M>): M => {
	const isep = did.indexOf(':', 4);
	const method = did.slice(4, isep);
	return method as M;
};
