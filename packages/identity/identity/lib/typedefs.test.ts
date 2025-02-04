import { describe, expect, it } from 'bun:test';

import { didDocument } from './typedefs.js';

describe('didDocument', () => {
	it('parses a did:plc document', () => {
		const doc = didDocument.parse({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			id: 'did:plc:ia76kvnndjutgedggx2ibrem',
			alsoKnownAs: ['at://mary.my.id'],
			verificationMethod: [
				{
					id: 'did:plc:ia76kvnndjutgedggx2ibrem#atproto',
					type: 'Multikey',
					controller: 'did:plc:ia76kvnndjutgedggx2ibrem',
					publicKeyMultibase: 'zQ3shuqiNQXNGKBBbNvPhcaZy8DjP3BF3yhmSeAjFXQjgPJrG',
				},
			],
			service: [
				{
					id: '#atproto_pds',
					type: 'AtprotoPersonalDataServer',
					serviceEndpoint: 'https://porcini.us-east.host.bsky.network',
				},
			],
		});

		expect(doc).toMatchInlineSnapshot(`
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1",
    "https://w3id.org/security/suites/secp256k1-2019/v1",
  ],
  "alsoKnownAs": [
    "at://mary.my.id",
  ],
  "id": "did:plc:ia76kvnndjutgedggx2ibrem",
  "service": [
    {
      "id": "did:plc:ia76kvnndjutgedggx2ibrem#atproto_pds",
      "serviceEndpoint": "https://porcini.us-east.host.bsky.network",
      "type": "AtprotoPersonalDataServer",
    },
  ],
  "verificationMethod": [
    {
      "controller": "did:plc:ia76kvnndjutgedggx2ibrem",
      "id": "did:plc:ia76kvnndjutgedggx2ibrem#atproto",
      "publicKeyMultibase": "zQ3shuqiNQXNGKBBbNvPhcaZy8DjP3BF3yhmSeAjFXQjgPJrG",
      "type": "Multikey",
    },
  ],
}
`);
	});

	it('parses a did:web document', () => {
		const doc = didDocument.parse({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			id: 'did:web:didd.uk',
			alsoKnownAs: [
				'at://didd.uk',
				'did:plc:kv7sv4lynbv5s6gdhn5r5vcw',
				'web+ap://bsky.brid.gy/@ducky.ws',
				'web+ap://fedia.social/@theducky',
				'https://t.me/theducky',
			],
			verificationMethod: [
				{
					id: 'did:web:didd.uk#atproto',
					type: 'Multikey',
					controller: 'did:web:didd.uk',
					publicKeyMultibase: 'zQ3shYRepkfnXhDjKBmvBVNtu2tswxPjjTDgKWTUcuFdt7xtH',
				},
			],
			service: [
				{
					id: '#atproto_pds',
					type: 'AtprotoPersonalDataServer',
					serviceEndpoint: 'https://zio.blue',
				},
			],
		});

		expect(doc).toMatchInlineSnapshot(`
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1",
    "https://w3id.org/security/suites/secp256k1-2019/v1",
  ],
  "alsoKnownAs": [
    "at://didd.uk",
    "did:plc:kv7sv4lynbv5s6gdhn5r5vcw",
    "web+ap://bsky.brid.gy/@ducky.ws",
    "web+ap://fedia.social/@theducky",
    "https://t.me/theducky",
  ],
  "id": "did:web:didd.uk",
  "service": [
    {
      "id": "did:web:didd.uk#atproto_pds",
      "serviceEndpoint": "https://zio.blue",
      "type": "AtprotoPersonalDataServer",
    },
  ],
  "verificationMethod": [
    {
      "controller": "did:web:didd.uk",
      "id": "did:web:didd.uk#atproto",
      "publicKeyMultibase": "zQ3shYRepkfnXhDjKBmvBVNtu2tswxPjjTDgKWTUcuFdt7xtH",
      "type": "Multikey",
    },
  ],
}
`);
	});
});
