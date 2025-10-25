import { getAtprotoHandle, getPdsEndpoint } from '@atcute/identity';
import type { DidDocumentResolver, HandleResolver } from '@atcute/identity-resolver';
import type { ActorIdentifier, Did, Handle } from '@atcute/lexicons';
import { isDid } from '@atcute/lexicons/syntax';

import { ResolverError } from '../errors.js';
import type { IdentityResolver, ResolvedIdentity, ResolveIdentityOptions } from '../types/identity.js';

export interface DefaultIdentityResolverOptions {
	handleResolver: HandleResolver;
	didDocumentResolver: DidDocumentResolver;
}

export const defaultIdentityResolver = ({
	handleResolver,
	didDocumentResolver,
}: DefaultIdentityResolverOptions): IdentityResolver => {
	return {
		async resolve(actor: ActorIdentifier, options?: ResolveIdentityOptions): Promise<ResolvedIdentity> {
			const identifierIsDid = isDid(actor);

			let did: Did;
			if (identifierIsDid) {
				did = actor;
			} else {
				did = await handleResolver.resolve(actor, options);
			}

			const doc = await didDocumentResolver.resolve(did, options);

			const pds = getPdsEndpoint(doc);
			if (!pds) {
				throw new ResolverError(`missing pds endpoint`);
			}

			let handle: Handle = 'handle.invalid';
			if (identifierIsDid) {
				const writtenHandle = getAtprotoHandle(doc);
				if (writtenHandle) {
					try {
						const resolved = await handleResolver.resolve(writtenHandle, options);

						if (resolved === did) {
							handle = writtenHandle;
						}
					} catch {}
				}
			} else if (getAtprotoHandle(doc) === actor) {
				handle = actor;
			}

			return {
				did: did,
				handle: handle,
				pds: new URL(pds).href,
			};
		},
	};
};
