import { Secp256k1PrivateKeyExportable } from '@atcute/crypto';
import { TestPlcServer } from '@atcute/internal-dev-env';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PlcClient, PlcClientError } from './client.js';
import type * as t from './types.js';
import { deriveDidFromGenesisOp, signOperation } from './utils.js';

describe('PlcClient', () => {
	let plc: TestPlcServer;
	let client: PlcClient;

	beforeAll(async () => {
		plc = await TestPlcServer.create();
		client = new PlcClient({ serviceUrl: plc.url });
	});

	afterAll(async () => {
		await plc.close();
	});

	it('can ping the server', async () => {
		const result = await client.ping();
		expect(result).toBe(true);
	});

	describe('DID creation', () => {
		let rotationKey: Secp256k1PrivateKeyExportable;
		let signingKey: Secp256k1PrivateKeyExportable;
		let did: t.DidPlcString;

		beforeAll(async () => {
			rotationKey = await Secp256k1PrivateKeyExportable.createKeypair();
			signingKey = await Secp256k1PrivateKeyExportable.createKeypair();
		});

		it('creates a new DID account', async () => {
			const rotationKeyDid = await rotationKey.exportPublicKey('did');
			const signingKeyDid = await signingKey.exportPublicKey('did');

			const unsignedOp: t.UnsignedOperation = {
				type: 'plc_operation',
				prev: null,
				alsoKnownAs: ['at://test.handle'],
				rotationKeys: [rotationKeyDid],
				services: {
					atproto_pds: {
						type: 'AtprotoPersonalDataServer',
						endpoint: 'https://pds.example.com',
					},
				},
				verificationMethods: {
					atproto: signingKeyDid,
				},
			};

			const signedOp = await signOperation(unsignedOp, rotationKey);
			did = await deriveDidFromGenesisOp(signedOp);

			await client.submitOperation(did, signedOp);

			// verify the DID was created by fetching its document
			const document = await client.getDocument(did);
			expect(document.id).toBe(did);
			expect(document.alsoKnownAs).toContain('at://test.handle');
		});

		it('fetches the state of the created DID', async () => {
			const state = await client.getState(did);

			expect(state.did).toBe(did);
			expect(state.alsoKnownAs).toContain('at://test.handle');
			expect(state.services.atproto_pds.endpoint).toBe('https://pds.example.com');
		});

		it('fetches the operation log', async () => {
			const log = await client.getOperationLog(did);

			expect(log).toHaveLength(1);
			expect(log[0].type).toBe('plc_operation');
		});

		it('fetches the audit log', async () => {
			const log = await client.getAuditLog(did);

			expect(log).toHaveLength(1);
			expect(log[0].did).toBe(did);
			expect(log[0].cid).toBeDefined();
			expect(log[0].createdAt).toBeDefined();
		});

		it('fetches the last operation', async () => {
			const lastOp = await client.getLastOperation(did);

			expect(lastOp.type).toBe('plc_operation');
			expect(lastOp.prev).toBeNull();
		});

		it('updates the DID with a new operation', async () => {
			const rotationKeyDid = await rotationKey.exportPublicKey('did');
			const signingKeyDid = await signingKey.exportPublicKey('did');

			// get last op for prev reference
			const lastOp = await client.getLastOperation(did);
			const auditLog = await client.getAuditLog(did);
			const prevCid = auditLog.at(-1)!.cid;

			const unsignedOp: t.UnsignedOperation = {
				type: 'plc_operation',
				prev: prevCid,
				alsoKnownAs: ['at://updated.handle'],
				rotationKeys: [rotationKeyDid],
				services: {
					atproto_pds: {
						type: 'AtprotoPersonalDataServer',
						endpoint: 'https://pds.example.com',
					},
				},
				verificationMethods: {
					atproto: signingKeyDid,
				},
			};

			const signedOp = await signOperation(unsignedOp, rotationKey);
			await client.submitOperation(did, signedOp);

			// verify the update
			const document = await client.getDocument(did);
			expect(document.alsoKnownAs).toContain('at://updated.handle');
		});
	});

	describe('error handling', () => {
		it('throws PlcClientError on invalid operation', async () => {
			const key = await Secp256k1PrivateKeyExportable.createKeypair();
			const keyDid = await key.exportPublicKey('did');

			const unsignedOp: t.UnsignedOperation = {
				type: 'plc_operation',
				prev: null,
				alsoKnownAs: ['at://test.handle'],
				rotationKeys: [keyDid],
				services: {
					atproto_pds: {
						type: 'AtprotoPersonalDataServer',
						endpoint: 'https://pds.example.com',
					},
				},
				verificationMethods: {
					atproto: keyDid,
				},
			};

			const signedOp = await signOperation(unsignedOp, key);

			// submit to wrong DID to trigger an error
			const wrongDid = 'did:plc:aaaaaaaaaaaaaaaaaaaaaa' as t.DidPlcString;

			await expect(client.submitOperation(wrongDid, signedOp)).rejects.toThrow(PlcClientError);
		});

		it('includes error message from server', async () => {
			const key = await Secp256k1PrivateKeyExportable.createKeypair();
			const keyDid = await key.exportPublicKey('did');

			const unsignedOp: t.UnsignedOperation = {
				type: 'plc_operation',
				prev: null,
				alsoKnownAs: ['at://test.handle'],
				rotationKeys: [keyDid],
				services: {
					atproto_pds: {
						type: 'AtprotoPersonalDataServer',
						endpoint: 'https://pds.example.com',
					},
				},
				verificationMethods: {
					atproto: keyDid,
				},
			};

			const signedOp = await signOperation(unsignedOp, key);
			const wrongDid = 'did:plc:aaaaaaaaaaaaaaaaaaaaaa' as t.DidPlcString;

			try {
				await client.submitOperation(wrongDid, signedOp);
				expect.fail('should have thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(PlcClientError);
				const plcError = error as PlcClientError;
				expect(plcError.status).toBe(400);
				expect(plcError.body).toBeDefined();
				expect(plcError.body?.message).toBeDefined();
			}
		});
	});
});
