import type { ActorIdentifier } from '@atcute/lexicons';

import { identityResolver } from './environment.js';
import { ResolverError } from './errors.js';
import type { ResolvedIdentity } from './types/identity.js';
import type { AuthorizationServerMetadata, ProtectedResourceMetadata } from './types/server.js';
import { extractContentType } from './utils/response.js';
import { isValidUrl } from './utils/strings.js';

export const resolveFromIdentifier = async (
	ident: ActorIdentifier,
): Promise<{ identity: ResolvedIdentity; metadata: AuthorizationServerMetadata }> => {
	const identity = await identityResolver.resolve(ident);

	return {
		identity: identity,
		metadata: await getMetadataFromResourceServer(identity.pds),
	};
};

export const resolveFromService = async (
	host: string,
): Promise<{ metadata: AuthorizationServerMetadata }> => {
	try {
		const metadata = await getMetadataFromResourceServer(host);
		return { metadata };
	} catch (err) {
		if (err instanceof ResolverError) {
			try {
				const metadata = await getAuthorizationServerMetadata(host);
				return { metadata };
			} catch {}
		}

		throw err;
	}
};

const getProtectedResourceMetadata = async (host: string): Promise<ProtectedResourceMetadata> => {
	const url = new URL(`/.well-known/oauth-protected-resource`, host);
	const response = await fetch(url.href, {
		redirect: 'manual',
		headers: {
			accept: 'application/json',
		},
	});

	if (response.status !== 200 || extractContentType(response.headers) !== 'application/json') {
		throw new ResolverError(`unexpected response`);
	}

	const metadata = (await response.json()) as ProtectedResourceMetadata;
	if (metadata.resource !== url.origin) {
		throw new ResolverError(`unexpected issuer`);
	}

	return metadata;
};

const getAuthorizationServerMetadata = async (host: string): Promise<AuthorizationServerMetadata> => {
	const url = new URL(`/.well-known/oauth-authorization-server`, host);
	const response = await fetch(url.href, {
		redirect: 'manual',
		headers: {
			accept: 'application/json',
		},
	});

	if (response.status !== 200 || extractContentType(response.headers) !== 'application/json') {
		throw new ResolverError(`unexpected response`);
	}

	const metadata = (await response.json()) as AuthorizationServerMetadata;
	if (metadata.issuer !== url.origin) {
		throw new ResolverError(`unexpected issuer`);
	}
	if (!isValidUrl(metadata.authorization_endpoint)) {
		throw new ResolverError(`authorization server provided incorrect authorization endpoint`);
	}
	if (!metadata.client_id_metadata_document_supported) {
		throw new ResolverError(`authorization server does not support 'client_id_metadata_document'`);
	}
	if (!metadata.pushed_authorization_request_endpoint) {
		throw new ResolverError(`authorization server does not support 'pushed_authorization request'`);
	}
	if (metadata.response_types_supported) {
		if (!metadata.response_types_supported.includes('code')) {
			throw new ResolverError(`authorization server does not support 'code' response type`);
		}
	}

	return metadata;
};

const getMetadataFromResourceServer = async (input: string) => {
	const rs_metadata = await getProtectedResourceMetadata(input);

	if (rs_metadata.authorization_servers?.length !== 1) {
		throw new ResolverError(`expected exactly one authorization server in the listing`);
	}

	const issuer = rs_metadata.authorization_servers[0];

	const as_metadata = await getAuthorizationServerMetadata(issuer);

	if (as_metadata.protected_resources) {
		if (!as_metadata.protected_resources.includes(rs_metadata.resource)) {
			throw new ResolverError(`server is not in authorization server's jurisdiction`);
		}
	}

	return as_metadata;
};
