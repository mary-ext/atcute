import { isDid, type Did } from './did.js';
import { isHandle, type Handle } from './handle.js';

/**
 * represents an account's identifier, either a {@link Did} or a
 * {@link Handle}
 */
export type Identifier = Did | Handle;

// #__NO_SIDE_EFFECTS__
export const isIdentifier = (input: unknown): input is Identifier => {
	return isDid(input) || isHandle(input);
};
