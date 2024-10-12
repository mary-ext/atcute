type UnwrapArray<T> = T extends (infer V)[] ? V : never;

export const pick = <T, K extends (keyof T)[]>(obj: T, keys: K): Pick<T, UnwrapArray<K>> => {
	const cloned = {};

	for (let idx = 0, len = keys.length; idx < len; idx++) {
		const key = keys[idx];

		// @ts-expect-error
		cloned[key] = obj[key];
	}

	return cloned as Pick<T, UnwrapArray<K>>;
};
