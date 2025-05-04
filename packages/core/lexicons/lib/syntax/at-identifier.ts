import { isDid, type Did } from './did.js';
import { isHandle, type Handle } from './handle.js';

/**
 * represents an account's identifier, either a {@link Did} or a
 * {@link Handle}
 */
export type ActorIdentifier = Did | Handle;

// #__NO_SIDE_EFFECTS__
export const isActorIdentifier = (input: unknown): input is ActorIdentifier => {
	return isDid(input) || isHandle(input);
};
