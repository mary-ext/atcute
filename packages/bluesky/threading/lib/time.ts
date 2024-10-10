let lastTimestamp: number = 0;

/**
 * Return the current time, make sure that each call never returns same value
 * so that posts sent at the same time from different accounts don't end up
 * colliding with each other potentially causing them to not be shown.
 */
export function getNow(threadSize: number): number {
	let timestamp = Math.max(Date.now(), lastTimestamp);
	lastTimestamp = timestamp + 2 + threadSize;

	return timestamp;
}
