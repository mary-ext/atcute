import type { Did } from '../types.js';

export const DID_PLC_RE = /^did:plc:([a-z2-7]{24})$/;

/**
 * checks if input is a did:plc identifier
 */
export const isDidPlc = (input: string): input is Did<'plc'> => {
	return input.length === 32 && DID_PLC_RE.test(input);
};
