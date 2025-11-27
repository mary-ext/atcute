import {
	getPublicKeyFromDidController,
	P256PublicKey,
	Secp256k1PublicKey,
	type PublicKey,
} from '@atcute/crypto';
import { getAtprotoVerificationMaterial, getPdsEndpoint } from '@atcute/identity';
import type { DidDocumentResolver } from '@atcute/identity-resolver';
import { lexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';
import type { AtprotoDid, Nsid } from '@atcute/lexicons/syntax';
import { verifyRecord, type VerifiedRecord } from '@atcute/repo';

import { FailedResponseError } from '@atcute/util-fetch';

import { LEXICON_SCHEMA_COLLECTION } from '../constants.js';
import * as err from '../errors.js';
import type { ResolvedSchema, ResolveLexiconRecordOptions } from '../types.js';

export interface LexiconSchemaResolverOptions {
	didDocumentResolver: DidDocumentResolver;
	fetch?: typeof fetch;
}

export class LexiconSchemaResolver {
	readonly didDocumentResolver: DidDocumentResolver;
	#fetch: typeof fetch;

	constructor({ didDocumentResolver, fetch: fetchThis = fetch }: LexiconSchemaResolverOptions) {
		this.didDocumentResolver = didDocumentResolver;
		this.#fetch = fetchThis;
	}

	async resolve(
		authority: AtprotoDid,
		nsid: Nsid,
		options?: ResolveLexiconRecordOptions,
	): Promise<ResolvedSchema> {
		// Step 1: Resolve DID to get PDS service endpoint
		const didDocument = await this.didDocumentResolver.resolve(authority, {
			signal: options?.signal,
			noCache: options?.noCache,
		});

		const pdsEndpoint = getPdsEndpoint(didDocument);

		if (!pdsEndpoint) {
			throw new err.FailedLexiconResolutionError(nsid, {
				cause: new TypeError(`no pds service in did document; did=${authority}`),
			});
		}

		// Step 2: Fetch the record
		let carBytes: Uint8Array;
		try {
			const url = new URL('/xrpc/com.atproto.sync.getRecord', pdsEndpoint);
			url.searchParams.set('did', authority);
			url.searchParams.set('collection', LEXICON_SCHEMA_COLLECTION);
			url.searchParams.set('rkey', nsid);

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				headers: { accept: 'application/vnd.ipld.car' },
			});

			if (!response.ok) {
				throw new FailedResponseError(response);
			}

			carBytes = await response.bytes();
		} catch (cause) {
			throw new err.FailedLexiconResolutionError(nsid, { cause });
		}

		// Step 3: Verify record and extract data
		let verifiedRecord: VerifiedRecord;
		try {
			// Extract public key from DID document for signature verification
			const controller = getAtprotoVerificationMaterial(didDocument);
			if (!controller) {
				throw new Error(`did document does not contain verification material`);
			}

			const found = getPublicKeyFromDidController(controller);

			let publicKey: PublicKey;
			switch (found.type) {
				case 'p256': {
					publicKey = await P256PublicKey.importRaw(found.publicKeyBytes);
					break;
				}
				case 'secp256k1': {
					publicKey = await Secp256k1PublicKey.importRaw(found.publicKeyBytes);
					break;
				}
			}

			verifiedRecord = await verifyRecord({
				did: authority,
				collection: LEXICON_SCHEMA_COLLECTION,
				rkey: nsid,
				publicKey,
				carBytes,
			});
		} catch (cause) {
			throw new err.InvalidLexiconProofError(nsid, { cause });
		}

		// Step 4: Parse into lexicon schema
		const rawSchema = verifiedRecord.record;
		if (
			typeof rawSchema !== 'object' ||
			rawSchema === null ||
			(rawSchema as any).$type !== LEXICON_SCHEMA_COLLECTION ||
			(rawSchema as any).id !== nsid
		) {
			throw new err.InvalidLexiconSchemaError(nsid);
		}

		let schema: LexiconDoc;
		try {
			schema = lexiconDoc.parse(rawSchema, { mode: 'passthrough' });
		} catch (cause) {
			throw new err.InvalidLexiconSchemaError(nsid, { cause });
		}

		return {
			uri: `at://${authority}/${LEXICON_SCHEMA_COLLECTION}/${nsid}`,
			cid: verifiedRecord.cid,
			rawSchema: verifiedRecord.record,
			schema: schema,
		};
	}
}
