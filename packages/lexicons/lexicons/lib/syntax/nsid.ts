/**
 * represents a namespace identifier (NSID)
 */
export type Nsid = `${string}.${string}.${string}`;

const NSID_RE =
	/^[a-zA-Z](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+\.[a-zA-Z][a-zA-Z0-9]{0,62}?$/;

// #__NO_SIDE_EFFECTS__
export const isNsid = (input: unknown): input is Nsid => {
	return typeof input === 'string' && input.length >= 5 && input.length <= 317 && NSID_RE.test(input);
};
