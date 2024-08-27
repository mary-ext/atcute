import type { IdResolver } from '@atproto/identity';

import axios from 'axios';

import type { TestPdsServer } from './pds.js';

export const mockNetworkUtilities = (pds: TestPdsServer) => {
	mockResolvers(pds.ctx.idResolver, pds);
};

export const mockResolvers = (idResolver: IdResolver, pds: TestPdsServer) => {
	// Map pds public url to its local url when resolving from plc
	const origResolveDid = idResolver.did.resolveNoCache;
	idResolver.did.resolveNoCache = async (did: string) => {
		const result = await (origResolveDid.call(idResolver.did, did) as ReturnType<typeof origResolveDid>);
		const service = result?.service?.find((svc) => svc.id === '#atproto_pds');

		if (typeof service?.serviceEndpoint === 'string') {
			service.serviceEndpoint = service.serviceEndpoint.replace(
				pds.ctx.cfg.service.publicUrl,
				`http://localhost:${pds.port}`,
			);
		}

		return result;
	};

	const origResolveHandleDns = idResolver.handle.resolveDns;
	idResolver.handle.resolve = async (handle: string) => {
		const isPdsHandle = pds.ctx.cfg.identity.serviceHandleDomains.some((domain) => handle.endsWith(domain));

		if (!isPdsHandle) {
			return origResolveHandleDns.call(idResolver.handle, handle);
		}

		const url = `${pds.url}/.well-known/atproto-did`;
		try {
			const res = await axios.get(url, { headers: { host: handle } });
			return res.data;
		} catch (err) {
			return undefined;
		}
	};
};
