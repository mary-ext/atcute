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

export const allowsEval = /*#__PURE__*/ lazy((): boolean => {
	if (typeof navigator !== 'undefined' && navigator?.userAgent?.includes('Cloudflare')) {
		return false;
	}

	try {
		const F = Function;
		// oxlint-disable-next-line no-new -- intentional check for Function constructor availability
		new F('');
		return true;
	} catch {
		return false;
	}
});
