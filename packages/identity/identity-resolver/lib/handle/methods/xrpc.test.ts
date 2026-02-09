import { describe, expect, it } from 'vitest';

import { XrpcHandleResolver } from './xrpc.ts';

const SERVICE_URL = 'https://pds.example.com';

describe('XrpcHandleResolver', () => {
	it('resolves handle correctly', async () => {
		const resolver = new XrpcHandleResolver({
			serviceUrl: SERVICE_URL,
			async fetch(input, init) {
				const request = new Request(input, init);
				const url = new URL(request.url);

				expect(url.host).toBe('pds.example.com');
				expect(url.pathname).toBe('/xrpc/com.atproto.identity.resolveHandle');

				const handle = url.searchParams.get('handle');
				expect(handle).toBe('example.com');

				return Response.json({ did: 'did:plc:ia76kvnndjutgedggx2ibrem' });
			},
		});

		const did = await resolver.resolve('example.com');
		expect(did).toBe('did:plc:ia76kvnndjutgedggx2ibrem');
	});
});
