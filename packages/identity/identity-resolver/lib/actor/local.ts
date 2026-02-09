import { getAtprotoHandle, getPdsEndpoint } from '@atcute/identity';
import { isDid, type ActorIdentifier, type Did, type Handle } from '@atcute/lexicons/syntax';

import { ActorResolutionError } from '../errors.ts';
import type {
	ActorResolver,
	DidDocumentResolver,
	HandleResolver,
	ResolveActorOptions,
	ResolvedActor,
} from '../types.ts';

export interface LocalActorResolverOptions {
	handleResolver: HandleResolver;
	didDocumentResolver: DidDocumentResolver;
}

export class LocalActorResolver implements ActorResolver {
	handleResolver: HandleResolver;
	didDocumentResolver: DidDocumentResolver;

	constructor(options: LocalActorResolverOptions) {
		this.handleResolver = options.handleResolver;
		this.didDocumentResolver = options.didDocumentResolver;
	}

	async resolve(actor: ActorIdentifier, options?: ResolveActorOptions): Promise<ResolvedActor> {
		const identifierIsDid = isDid(actor);

		let did: Did;
		if (identifierIsDid) {
			did = actor as Did;
		} else {
			try {
				did = await this.handleResolver.resolve(actor as Handle, options);
			} catch (err) {
				throw new ActorResolutionError(`failed to resolve handle`, { cause: err });
			}
		}

		let doc;
		try {
			doc = await this.didDocumentResolver.resolve(did, options);
		} catch (err) {
			throw new ActorResolutionError(`failed to resolve did document`, { cause: err });
		}

		const pds = getPdsEndpoint(doc);
		if (!pds) {
			throw new ActorResolutionError(`missing pds endpoint`);
		}

		let handle: Handle = 'handle.invalid';
		if (identifierIsDid) {
			const writtenHandle = getAtprotoHandle(doc);
			if (writtenHandle) {
				try {
					const resolved = await this.handleResolver.resolve(writtenHandle, options);

					if (resolved === did) {
						handle = writtenHandle;
					}
				} catch {}
			}
		} else if (getAtprotoHandle(doc) === actor) {
			handle = actor as Handle;
		}

		return {
			did: did,
			handle: handle,
			pds: new URL(pds).href,
		};
	}
}
