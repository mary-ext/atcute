// oxlint-disable typescript/no-explicit-any

/** recursively marks every property of `T` as readonly. */
export type ReadonlyDeep<T> = T extends (...args: any[]) => any
	? T
	: T extends readonly (infer U)[]
		? readonly ReadonlyDeep<U>[]
		: T extends object
			? { readonly [K in keyof T]: ReadonlyDeep<T[K]> }
			: T;
