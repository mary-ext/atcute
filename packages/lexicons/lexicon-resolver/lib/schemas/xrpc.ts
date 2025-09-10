import * as v from '@badrap/valita';

import { getPdsEndpoint } from '@atcute/identity';
import type { DidDocumentResolver } from '@atcute/identity-resolver';
import { lexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';
import type { AtprotoDid, Nsid } from '@atcute/lexicons/syntax';

import {
	FailedResponseError,
	isResponseOk,
	parseResponseAsJson,
	pipe,
	validateJsonWith,
} from '@atcute/util-fetch';

import * as err from '../errors.js';
import type { ResolveLexiconRecordOptions } from '../types.js';
import { verifyLexiconRecord } from './verify.js';

// basic sanity checks, we'll have it go through `lexiconDoc` later
const lexiconSchemaRaw = v.object({
	$type: v.literal('com.atproto.lexicon.schema'),
	id: v.string(),
	lexicon: v.number().assert((input) => Number.isSafeInteger(input) && input >= 0),
});

// com.atproto.repo.getRecord response structure
const getRecordResponse = v.object({
	uri: v.string(),
	cid: v.string(),
	value: lexiconSchemaRaw,
});

const fetchXrpcHandler = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/json$/, (1024 + 10) * 1024),
	validateJsonWith(getRecordResponse, { mode: 'passthrough' }),
);

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
	): Promise<LexiconDoc> {
		// Step 1: Resolve DID to get PDS service endpoint
		const didDocument = await this.didDocumentResolver.resolve(authority, {
			signal: options?.signal,
			noCache: options?.noCache,
		});

		// Step 2: Extract PDS service endpoint from DID document
		const pdsEndpoint = getPdsEndpoint(didDocument);

		if (!pdsEndpoint) {
			throw new err.FailedLexiconResolutionError(nsid, {
				cause: new TypeError(`no pds service in did document; did=${authority}`),
			});
		}

		// Step 3: Fetch lexicon record from PDS
		let json: v.Infer<typeof getRecordResponse>;

		try {
			const url = new URL('/xrpc/com.atproto.repo.getRecord', pdsEndpoint);
			url.searchParams.set('repo', authority);
			url.searchParams.set('collection', 'com.atproto.lexicon.schema');
			url.searchParams.set('rkey', nsid);

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				headers: { accept: 'application/json' },
			});

			const handled = await fetchXrpcHandler(response);
			json = handled.json;
		} catch (cause) {
			if (cause instanceof FailedResponseError && cause.status === 404) {
				throw new err.LexiconNotFoundError(nsid);
			}

			throw new err.FailedLexiconResolutionError(nsid, { cause });
		}

		// Step 4: Parse into lexicon schema
		const rawSchema = json.value;
		if (rawSchema.id !== nsid) {
			throw new err.InvalidLexiconSchemaError(nsid, {
				cause: new TypeError(`lexicon nsid mismatch; expected=${nsid}; got=${rawSchema.id}`),
			});
		}

		let schema: LexiconDoc;
		try {
			schema = lexiconDoc.parse(rawSchema, { mode: 'passthrough' });
		} catch (cause) {
			throw new err.InvalidLexiconSchemaError(nsid, { cause });
		}

		// Step 5: Fetch CAR proof and verify record
		let carBytes: Uint8Array;
		try {
			const url = new URL('/xrpc/com.atproto.sync.getRecord', pdsEndpoint);
			url.searchParams.set('did', authority);
			url.searchParams.set('collection', 'com.atproto.lexicon.schema');
			url.searchParams.set('rkey', nsid);

			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
				cache: options?.noCache ? 'no-cache' : undefined,
				headers: { accept: 'application/vnd.ipld.car' },
			});

			if (!response.ok) {
				throw new FailedResponseError(response.status, `got http ${response.status}`);
			}

			carBytes = await response.bytes();
		} catch (cause) {
			throw new err.InvalidLexiconProofError(nsid, { cause });
		}

		// Step 6: Verify the record proof
		try {
			await verifyLexiconRecord({
				did: authority,
				cid: json.cid,
				record: rawSchema,
				didDocument,
				carBytes,
			});
		} catch (cause) {
			throw new err.InvalidLexiconProofError(nsid, { cause });
		}

		return schema;
	}
}
