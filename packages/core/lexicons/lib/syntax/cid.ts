/**
 * represents a content identifier (CID)
 */
export type Cid = string;

const DASL_CID_RE = /^baf[ky]re(?:aa|i[a-z2-7]{52})$/;

// #__NO_SIDE_EFFECTS__
export const isCid = (input: unknown): input is Cid => {
	if (typeof input !== 'string') {
		return false;
	}

	const length = input.length;
	return (length === 8 || length === 59) && DASL_CID_RE.test(input);
};
