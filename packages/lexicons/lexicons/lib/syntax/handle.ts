/**
 * represents an account's handle, using domains as a human-friendly
 * identifier.
 */
export type Handle = `${string}.${string}`;

const HANDLE_RE =
	/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

// #__NO_SIDE_EFFECTS__
export const isHandle = (input: unknown): input is Handle => {
	return typeof input === 'string' && input.length >= 3 && input.length <= 253 && HANDLE_RE.test(input);
};
