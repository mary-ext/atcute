/**
 * represents a generic URI
 */
export type GenericUri = `${string}:${string}`;

const URI_RE = /^\w+:(?:\/\/)?[^\s/][^\s]*$/;

// #__NO_SIDE_EFFECTS__
export const isGenericUri = (input: unknown): input is GenericUri => {
	return typeof input === 'string' && input.length >= 3 && URI_RE.test(input);
};
