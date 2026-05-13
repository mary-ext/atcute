/** whether the native module is available for the current runtime. */
export const hasNative = false;

/**
 * returns the current time in microseconds since unix epoch.
 *
 * @returns timestamp in microseconds
 */
export const now = (): number => {
	return Date.now() * 1_000;
};
