export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const assert: { (condition: any, message?: string): asserts condition } = (condition, message) => {
	if (!condition) {
		if (import.meta.env.DEV) {
			throw new Error(`Assertion failed` + (message ? `: ${message}` : ``));
		}

		throw new Error(`Assertion failed`);
	}
};

export const assertNever = (value: never, message?: string): never => {
	assert(false, message);
};
