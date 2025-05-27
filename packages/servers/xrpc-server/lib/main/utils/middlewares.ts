export type Middleware<TParams extends any[], TReturn> = (
	...params: [...TParams, next: (...params: TParams) => TReturn]
) => TReturn;

export const createAsyncMiddlewareRunner = <TParams extends any[], TReturn>(
	middlewares: [...Middleware<TParams, Promise<TReturn>>[], Middleware<TParams, Promise<TReturn>>],
) => {
	// prettier-ignore
	return middlewares.reduceRight<(...params: TParams) => Promise<TReturn>>(
		(next, run) => (...args) => run(...args, next),
		() => Promise.reject(new Error(`middleware chain exhausted`)),
	);
};
