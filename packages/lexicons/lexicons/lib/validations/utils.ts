import { type CodeTag, type CreateOptions, create } from '@oomfware/eval';

import type { BaseSchema } from './index.ts';

// #__NO_SIDE_EFFECTS__
export const lazyProperty = <T>(obj: object, prop: string | number | symbol, value: T): T => {
	Object.defineProperty(obj, prop, { value });
	return value;
};

// #__NO_SIDE_EFFECTS__
export const lazy = <T>(getter: () => T): { readonly value: T } => {
	return {
		get value() {
			const value = getter();
			return lazyProperty(this, 'value', value);
		},
	};
};

export const isArray = Array.isArray;

// #__NO_SIDE_EFFECTS__
export const isObject = (input: unknown): input is Record<string, unknown> => {
	return typeof input === 'object' && input !== null && !isArray(input);
};

export type MatcherCompiler = (schema: BaseSchema, fallback: BaseSchema['~run']) => BaseSchema['~run'];

/** compiler installed by `enableCompilation()`, applied when matchers are first resolved */
export let compiler: MatcherCompiler | undefined;

export const setCompiler = (fn: MatcherCompiler): void => {
	compiler = fn;
};

const probeCodegen = (options?: CreateOptions): CodeTag | undefined => {
	try {
		const x = create(options);
		x.empty.eval();
		return x;
	} catch {
		return undefined;
	}
};

/** matcher codegen, or `undefined` if eval is unavailable */
export const codegen = /*#__PURE__*/ lazy((): CodeTag | undefined => {
	if (typeof navigator !== 'undefined' && navigator?.userAgent?.includes('Cloudflare')) {
		return undefined;
	}

	// CSP may block the policy name but allow eval without Trusted Types.
	return probeCodegen({ policyName: 'atcute-lexicons' }) ?? probeCodegen();
});
