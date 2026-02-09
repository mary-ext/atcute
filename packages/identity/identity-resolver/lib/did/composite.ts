import { extractDidMethod, type DidDocument } from '@atcute/identity';
import type { Did } from '@atcute/lexicons/syntax';

import * as err from '../errors.ts';
import type { DidDocumentResolver, ResolveDidDocumentOptions } from '../types.ts';

export interface CompositeDidDocumentResolverOptions<M extends string> {
	methods: { [K in M]: DidDocumentResolver<K> };
}

export class CompositeDidDocumentResolver<M extends string> implements DidDocumentResolver<M> {
	#methods: Map<string, DidDocumentResolver<M>>;

	constructor({ methods }: CompositeDidDocumentResolverOptions<M>) {
		this.#methods = new Map(Object.entries(methods));
	}

	async resolve(did: Did<M>, options?: ResolveDidDocumentOptions): Promise<DidDocument> {
		const method = extractDidMethod(did);

		const resolver = this.#methods.get(method);
		if (resolver === undefined) {
			throw new err.UnsupportedDidMethodError(did);
		}

		return await resolver.resolve(did, options);
	}
}
