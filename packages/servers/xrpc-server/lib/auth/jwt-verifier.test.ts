import { describe, expect, it } from 'vitest';

import { Secp256k1PrivateKeyExportable } from '@atcute/crypto';
import type { Did, Nsid } from '@atcute/lexicons';

import { createServiceJwt } from './jwt-creator.js';
import { ServiceJwtVerifier } from './jwt-verifier.js';

describe('ServiceJwtVerifier', () => {
	const issuerDid: Did = 'did:example:issuer123';
	const audienceDid: Did = 'did:example:audience456';
	const lxm: Nsid = 'com.example.method';

	it('should verify a valid JWT', async () => {
		const keypair = await Secp256k1PrivateKeyExportable.createKeypair();

		const verifier = new ServiceJwtVerifier({
			serviceDid: audienceDid,
			resolver: {
				async resolve(did) {
					return {
						'@context': [],
						id: did,
						verificationMethod: [
							{
								id: `${did}#atproto`,
								type: 'Multikey',
								controller: did,
								publicKeyMultibase: await keypair.exportPublicKey('multikey'),
							},
						],
					};
				},
			},
		});

		const jwt = await createServiceJwt({
			keypair: keypair,
			issuer: issuerDid,
			audience: audienceDid,
			lxm: lxm,
		});

		const result = await verifier.verify(jwt, { lxm: lxm });

		expect(result.ok).toBe(true);

		if (result.ok) {
			expect(result.value).toEqual({
				audience: audienceDid,
				issuer: issuerDid,
				lxm: lxm,
			});
		}
	});
});
