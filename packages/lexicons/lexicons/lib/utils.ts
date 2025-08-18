import { DEV } from 'esm-env';

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
