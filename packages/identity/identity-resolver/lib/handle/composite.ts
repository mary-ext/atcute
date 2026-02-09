import type { AtprotoDid, Handle } from '@atcute/lexicons/syntax';

import * as err from '../errors.ts';
import type { HandleResolver, ResolveHandleOptions } from '../types.ts';

export type CompositeStrategy = 'http-first' | 'dns-first' | 'race' | 'both';

export interface CompositeHandleResolverOptions {
	/** controls how the resolution is done, defaults to 'race' */
	strategy?: CompositeStrategy;
	/** the methods to use for resolving the handle. */
	methods: Record<'http' | 'dns', HandleResolver>;
}

export class CompositeHandleResolver implements HandleResolver {
	#methods: Record<'http' | 'dns', HandleResolver>;
	strategy: CompositeStrategy;

	constructor({ methods, strategy = 'race' }: CompositeHandleResolverOptions) {
		this.#methods = methods;
		this.strategy = strategy;
	}

	async resolve(handle: Handle, options?: ResolveHandleOptions): Promise<AtprotoDid> {
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
				httpPromise.catch(noop);

				const resolved = await dnsPromise.catch(noop);
				if (resolved) {
					controller.abort();
					return resolved;
				}

				return httpPromise;
			}
			case 'http-first': {
				dnsPromise.catch(noop);

				const resolved = await httpPromise.catch(noop);
				if (resolved) {
					controller.abort();
					return resolved;
				}

				return dnsPromise;
			}
			case 'both': {
				const [dnsResponse, httpResponse] = await Promise.allSettled([dnsPromise, httpPromise]);

				const dnsDid = dnsResponse.status === 'fulfilled' ? dnsResponse.value : undefined;
				const httpDid = httpResponse.status === 'fulfilled' ? httpResponse.value : undefined;

				if (dnsDid && httpDid && dnsDid !== httpDid) {
					throw new err.AmbiguousHandleError(handle);
				}

				return dnsDid || httpDid || dnsPromise;
			}
		}
	}
}

const noop = () => {};
