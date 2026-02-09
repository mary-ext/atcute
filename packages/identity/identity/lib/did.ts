import type { AtprotoAudience, AtprotoDid, Did } from '@atcute/lexicons/syntax';

import { isPlcDid } from './methods/plc.ts';
import { isAtprotoWebDid } from './methods/web.ts';

const FRAGMENT_RE = /^(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*$/;

/**
 * checks if it's a DID identifier that is supported by atproto
 */
export const isAtprotoDid = (input: string): input is AtprotoDid => {
	return isPlcDid(input) || isAtprotoWebDid(input);
};

export const isAtprotoAudience = (input: string): input is AtprotoAudience => {
	// 'did:web:a.co#f'
	if (input.length < 14) {
		return false;
	}

	const isep = input.indexOf('#', 12);
	if (isep === -1) {
		return false;
	}

	return FRAGMENT_RE.test(input.slice(isep + 1)) && isAtprotoDid(input.slice(0, isep));
};

/**
 * returns the DID's method
 */
export const extractDidMethod = <M extends string>(did: Did<M>): M => {
	const isep = did.indexOf(':', 4);
	const method = did.slice(4, isep);
	return method as M;
};
