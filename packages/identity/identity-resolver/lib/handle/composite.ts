import type { Did, Handle } from '@atcute/identity';

import type { HandleResolver, ResolveHandleOptions } from '../types.js';

export type CompositeStrategy = 'http-first' | 'dns-first' | 'race';

export interface CompositeHandleResolverOptions {
	/** controls how the resolution is done, defaults to 'race' */
	strategy?: CompositeStrategy;
	/** the methods to use for resolving the handle. */
	methods: Record<'http' | 'dns', HandleResolver>;
}

export class CompositeHandleResolver implements HandleResolver {
	#methods: Record<string, HandleResolver>;
	strategy: CompositeStrategy;

	constructor({ methods, strategy = 'race' }: CompositeHandleResolverOptions) {
		this.#methods = methods;
		this.strategy = strategy;
	}

	async resolve(handle: Handle, options?: ResolveHandleOptions): Promise<Did> {
		const { http, dns } = this.#methods;

		const parentSignal = options?.signal;
		const controller = new AbortController();
		if (parentSignal) {
			parentSignal.addEventListener('abort', () => controller.abort(), { signal: controller.signal });
		}

		const dnsPromise = dns.resolve(handle, { ...options, signal: controller.signal });
		const httpPromise = http.resolve(handle, { ...options, signal: controller.signal });

		switch (this.strategy) {
			case 'race': {
				return new Promise((resolve) => {
					dnsPromise.then(
						(did) => {
							controller.abort();
							resolve(did);
						},
						() => resolve(httpPromise),
					);

					httpPromise.then(
						(did) => {
							controller.abort();
							resolve(did);
						},
						() => resolve(dnsPromise),
					);
				});
			}
			case 'dns-first': {
				const resolved = await dnsPromise.catch(noopPromise);
				if (resolved) {
					controller.abort();
					return resolved;
				}

				return httpPromise;
			}
			case 'http-first': {
				const resolved = await httpPromise.catch(noopPromise);
				if (resolved) {
					controller.abort();
					return resolved;
				}

				return dnsPromise;
			}
		}
	}
}

const noop = () => {};
const noopPromise = () => new Promise<never>(noop);
