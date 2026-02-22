/**
 * base error type for labeler-specific failures
 */
export class LabelerError extends Error {
	override name = 'LabelerError';
}

/**
 * error thrown when a subscription cursor is ahead of the store
 */
export class FutureCursorError extends LabelerError {
	override name = 'FutureCursorError';

	readonly cursor: number;
	readonly latest: number;

	/**
	 * creates a future-cursor error
	 * @param cursor requested cursor
	 * @param latest latest known sequence
	 */
	constructor(cursor: number, latest: number) {
		super(`cursor is in the future`);

		this.cursor = cursor;
		this.latest = latest;
	}
}

/**
 * error thrown when a subscriber cannot keep up with live events
 */
export class ConsumerTooSlowError extends LabelerError {
	override name = 'ConsumerTooSlowError';

	/**
	 * creates a consumer-too-slow error
	 */
	constructor() {
		super(`stream consumer too slow`);
	}
}
