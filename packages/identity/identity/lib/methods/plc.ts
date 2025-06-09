import type { Did } from '@atcute/lexicons/syntax';

/** @deprecated use `isPlcDid` instead */
export const PLC_DID_RE = /^did:plc:([a-z2-7]{24})$/;

/**
 * checks if input is a did:plc identifier
 */
export const isPlcDid = (input: string): input is Did<'plc'> => {
	return input.length === 32 && PLC_DID_RE.test(input);
};
