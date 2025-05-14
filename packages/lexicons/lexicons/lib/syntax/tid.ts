/**
 * represents a timestamp identifier (TID)
 */
export type Tid = string;

const TID_RE = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;

// #__NO_SIDE_EFFECTS__
export const isTid = (input: unknown): input is Tid => {
	return typeof input === 'string' && input.length === 13 && TID_RE.test(input);
};
