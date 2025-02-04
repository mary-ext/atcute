import { extractDidMethod, type Did, type DidDocument } from '@atcute/identity';

import * as err from '../errors.js';
import type { DidResolver, ResolveDidOptions } from '../types.js';

export interface CompositeDidResolverOptions<M extends string> {
	methods: Record<M, DidResolver<M>>;
}

export class CompositeDidResolver<M extends string> implements DidResolver<M> {
	#methods: Map<string, DidResolver<M>>;

	constructor({ methods }: CompositeDidResolverOptions<M>) {
		this.#methods = new Map(Object.entries(methods));
	}

	async resolve(did: Did<M>, options?: ResolveDidOptions): Promise<DidDocument> {
		const method = extractDidMethod(did);

		const resolver = this.#methods.get(method);
		if (resolver === undefined) {
			throw new err.UnsupportedDidMethodError(did);
		}

		return await resolver.resolve(did, options);
	}
}
