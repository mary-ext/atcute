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

// AT Protocol lexicon schema record structure - validate $type, then use lexiconDoc
const lexiconSchemaRecord = v
	.object({
		$type: v.literal('com.atproto.lexicon.schema'),
	})
	.chain((input) => {
		// After validating $type, validate the full lexicon document
		return lexiconDoc.try(input, { mode: 'passthrough' }) as v.ValitaResult<LexiconSchemaRecord>;
	});

// com.atproto.repo.getRecord response structure
const getRecordResponse = v.object({
	uri: v.string(),
	cid: v.string(),
	value: lexiconSchemaRecord,
});

const fetchXrpcHandler = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/json$/, 256 * 1024), // 256KB limit for lexicon schemas
	validateJsonWith(getRecordResponse, { mode: 'passthrough' }),
);

export interface LexiconSchemaResolverOptions {
	didDocumentResolver: DidDocumentResolver;
	fetch?: typeof fetch;
}

export interface LexiconSchemaRecord extends LexiconDoc {
	$type: 'com.atproto.lexicon.schema';
}

export class LexiconSchemaResolver {
	readonly didDocumentResolver: DidDocumentResolver;
	#fetch: typeof fetch;

	constructor({ didDocumentResolver, fetch: fetchThis = fetch }: LexiconSchemaResolverOptions) {
		this.didDocumentResolver = didDocumentResolver;
		this.#fetch = fetchThis;
	}

	async resolve(
		did: AtprotoDid,
		nsid: Nsid,
		options?: ResolveLexiconRecordOptions,
	): Promise<LexiconSchemaRecord> {
		// Step 1: Resolve DID to get PDS service endpoint
		const didDocument = await this.didDocumentResolver.resolve(did, {
			signal: options?.signal,
			noCache: options?.noCache,
		});

		// Step 2: Extract PDS service endpoint from DID document
		const pdsEndpoint = getPdsEndpoint(didDocument);

		if (!pdsEndpoint) {
			throw new err.FailedLexiconResolutionError(nsid, {
				cause: new TypeError(`no pds service in did document; did=${did}`),
			});
		}

		// Step 3: Fetch lexicon record from PDS
		let json: v.Infer<typeof getRecordResponse>;

		try {
			const url = new URL('/xrpc/com.atproto.repo.getRecord', pdsEndpoint);
			url.searchParams.set('repo', did);
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

		// Step 4: Validate that the lexicon ID matches the requested NSID
		const record = json.value;
		if (record.id !== nsid) {
			throw new err.InvalidLexiconError(nsid, {
				cause: new TypeError(`lexicon nsid mismatch; expected=${nsid}; got=${record.id}`),
			});
		}

		return record;
	}
}
