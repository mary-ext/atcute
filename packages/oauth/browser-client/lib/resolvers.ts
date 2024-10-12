import type { At, ComAtprotoIdentityResolveHandle } from '@atcute/client/lexicons';
import { type DidDocument, getPdsEndpoint } from '@atcute/client/utils/did';

import { DEFAULT_APPVIEW_URL } from './constants.js';
import { ResolverError } from './errors.js';
import type { IdentityMetadata } from './types/identity.js';
import type { AuthorizationServerMetadata, ProtectedResourceMetadata } from './types/server.js';
import { extractContentType } from './utils/response.js';
import { isDid } from './utils/strings.js';

const DID_WEB_RE = /^([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,}))$/;

/**
 * Resolves domain handles into DID identifiers, by requesting Bluesky's AppView
 * for identity resolution.
 * @param handle Domain handle to resolve
 * @returns DID identifier resolved from the domain handle
 */
export const resolveHandle = async (handle: string): Promise<At.DID> => {
	const url = DEFAULT_APPVIEW_URL + `/xrpc/com.atproto.identity.resolveHandle` + `?handle=${handle}`;

	const response = await fetch(url);
	if (response.status === 400) {
		throw new ResolverError(`domain handle not found`);
	} else if (!response.ok) {
		throw new ResolverError(`directory is unreachable`);
	}

	const json = (await response.json()) as ComAtprotoIdentityResolveHandle.Output;
	return json.did;
};

/**
 * Get DID documents of did:plc (via plc.directory) and did:web identifiers
 * @param did DID identifier we're seeking DID doc from
 * @returns Retrieved DID document
 */
export const getDidDocument = async (did: At.DID): Promise<DidDocument> => {
	const colon_index = did.indexOf(':', 4);

	const type = did.slice(4, colon_index);
	const ident = did.slice(colon_index + 1);

	// 2. retrieve their DID documents
	let doc: DidDocument;

	if (type === 'plc') {
		const response = await fetch(`https://plc.directory/${did}`);

		if (response.status === 404) {
			throw new ResolverError(`did not found in directory`);
		} else if (!response.ok) {
			throw new ResolverError(`directory is unreachable`);
		}

		const json = await response.json();

		doc = json as DidDocument;
	} else if (type === 'web') {
		if (!DID_WEB_RE.test(ident)) {
			throw new ResolverError(`invalid identifier`);
		}

		const response = await fetch(`https://${ident}/.well-known/did.json`);

		if (!response.ok) {
			throw new ResolverError(`did document is unreachable`);
		}

		const json = await response.json();

		doc = json as DidDocument;
	} else {
		throw new ResolverError(`unsupported did method`);
	}

	return doc;
};

/**
 * Get OAuth protected resource metadata from a host
 * @param host URL of the host
 * @returns Retrieved protected resource metadata
 */
export const getProtectedResourceMetadata = async (host: string): Promise<ProtectedResourceMetadata> => {
	const url = new URL(`/.well-known/oauth-protected-resource`, host);
	const response = await fetch(url, {
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

/**
 * Get OAuth authorization server metadata from a host
 * @param host URL of the host
 * @returns Retrieved authorization server metadata
 */
export const getAuthorizationServerMetadata = async (host: string): Promise<AuthorizationServerMetadata> => {
	const url = new URL(`/.well-known/oauth-authorization-server`, host);
	const response = await fetch(url, {
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

/**
 * Resolve handle domains or DID identifiers to get their PDS and its authorization server metadata
 * @param ident Handle domain or DID identifier to resolve
 * @returns Resolved PDS and authorization server metadata
 */
export const resolveFromIdentity = async (
	ident: string,
): Promise<{ identity: IdentityMetadata; metadata: AuthorizationServerMetadata }> => {
	let did: At.DID;
	if (isDid(ident)) {
		did = ident;
	} else {
		const resolved = await resolveHandle(ident);
		did = resolved;
	}

	const doc = await getDidDocument(did);
	const pds = getPdsEndpoint(doc);

	if (!pds) {
		throw new ResolverError(`missing pds endpoint`);
	}

	return {
		identity: {
			id: did,
			raw: ident,
			pds: new URL(pds),
		},
		metadata: await getMetadataFromResourceServer(pds),
	};
};

/**
 * Request authorization server metadata from a PDS
 * @param host URL of the host
 * @returns Resolved authorization server metadata
 */
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

/**
 * Request authorization server metadata from its protected resource metadata
 * @param input URL of the host whose authorization server is delegated
 * @returns Resolved authorization server metadata
 */
export const getMetadataFromResourceServer = async (input: string) => {
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
