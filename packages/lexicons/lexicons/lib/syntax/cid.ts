/**
 * represents a content identifier (CID)
 */
export type Cid = string;

const DASL_CID_RE = /^baf[ky]rei[a-z2-7]{52}$/;

// #__NO_SIDE_EFFECTS__
export const isCid = (input: unknown): input is Cid => {
	return typeof input === 'string' && input.length === 59 && DASL_CID_RE.test(input);
};
