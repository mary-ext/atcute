// #__NO_SIDE_EFFECTS__
export const lazy = <T>(getter: () => T): { readonly value: T } => {
	return {
		get value() {
			const value = getter();

			Object.defineProperty(this, 'value', { value });
			return value;
		},
	};
};

export const isArray = /*#__PURE__*/ Array.isArray;

// #__NO_SIDE_EFFECTS__
export const isObject = (input: unknown): input is Record<string, unknown> => {
	return typeof input === 'object' && input !== null && !isArray(input);
};
