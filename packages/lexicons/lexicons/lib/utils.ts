import { DEV } from 'esm-env';

// oxlint-disable-next-line typescript/no-explicit-any
export const assert: { (condition: any, message?: string): asserts condition } = (condition, message) => {
	if (!condition) {
		if (DEV) {
			throw new Error(`Assertion failed` + (message ? `: ${message}` : ``));
		}

		throw new Error(`Assertion failed`);
	}
};

export const assertNever = (_: never, message?: string): never => {
	assert(false, message);
};
