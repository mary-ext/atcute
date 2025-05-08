/**
 * represents a decentralized identifier (DID).
 */
export type Did<Method extends string = string> = `did:${Method}:${string}`;

/**
 * represents a decentralized identifier with methods supported in atproto
 */
export type AtprotoDid = Did<'plc' | 'web'>;

const DID_RE = /^did:([a-z]+):([a-zA-Z0-9._:%\-]*[a-zA-Z0-9._\-])$/;

// #__NO_SIDE_EFFECTS__
export const isDid = (input: unknown): input is Did => {
	return typeof input === 'string' && input.length >= 7 && input.length <= 2048 && DID_RE.test(input);
};
