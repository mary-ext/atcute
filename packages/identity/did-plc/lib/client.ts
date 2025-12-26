import type { DidDocument } from '@atcute/identity';
import { defs as identityDefs } from '@atcute/identity';
import { FailedResponseError, isResponseOk, parseResponseAsJson, pipe, validateJsonWith } from '@atcute/util-fetch';

import * as defs from './typedefs.js';
import * as t from './types.js';

const MAX_RESPONSE_SIZE = 64 * 1024;

const handleDocument = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/(did\+ld\+)?json$/, MAX_RESPONSE_SIZE),
	validateJsonWith(identityDefs.didDocument, { mode: 'passthrough' }),
);

const handlePlcState = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/json$/, MAX_RESPONSE_SIZE),
	validateJsonWith(defs.plcState, { mode: 'passthrough' }),
);

const handleOperationLog = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/json$/, MAX_RESPONSE_SIZE),
	validateJsonWith(defs.operationLog, { mode: 'passthrough' }),
);

const handleIndexedEntryLog = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/json$/, MAX_RESPONSE_SIZE),
	validateJsonWith(defs.indexedEntryLog, { mode: 'passthrough' }),
);

const handleLastOperation = pipe(
	isResponseOk,
	parseResponseAsJson(/^application\/json$/, MAX_RESPONSE_SIZE),
	validateJsonWith(defs.compatibleOperationOrTombstone, { mode: 'passthrough' }),
);

export interface PlcClientOptions {
	/** plc directory URL, defaults to https://plc.directory */
	serviceUrl?: string;
	/** custom fetch function */
	fetch?: typeof globalThis.fetch;
}

export interface PlcRequestOptions {
	signal?: AbortSignal;
}

/**
 * client for interacting with plc.directory
 */
export class PlcClient {
	readonly serviceUrl: string;
	#fetch: typeof globalThis.fetch;

	constructor({ serviceUrl = 'https://plc.directory', fetch: fetchFn = fetch }: PlcClientOptions = {}) {
		this.serviceUrl = serviceUrl;
		this.#fetch = fetchFn;
	}

	/**
	 * fetches the DID document for a did:plc
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the DID document
	 */
	async getDocument(did: t.DidPlcString, options?: PlcRequestOptions): Promise<DidDocument> {
		const url = new URL(`/${encodeURIComponent(did)}`, this.serviceUrl);

		const response = await this.#fetch(url, {
			signal: options?.signal,
			headers: { accept: 'application/did+ld+json,application/json' },
		});

		const { json } = await handleDocument(response);
		return json;
	}

	/**
	 * fetches the current identity state for a did:plc
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the current plc state
	 */
	async getState(did: t.DidPlcString, options?: PlcRequestOptions): Promise<t.PlcState> {
		const url = new URL(`/${encodeURIComponent(did)}/data`, this.serviceUrl);

		const response = await this.#fetch(url, {
			signal: options?.signal,
			headers: { accept: 'application/json' },
		});

		const { json } = await handlePlcState(response);
		return json;
	}

	/**
	 * fetches the operation log for a did:plc
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the operation log
	 */
	async getOperationLog(did: t.DidPlcString, options?: PlcRequestOptions): Promise<t.OperationLog> {
		const url = new URL(`/${encodeURIComponent(did)}/log`, this.serviceUrl);

		const response = await this.#fetch(url, {
			signal: options?.signal,
			headers: { accept: 'application/json' },
		});

		const { json } = await handleOperationLog(response);
		return json;
	}

	/**
	 * fetches the auditable log for a did:plc (includes CIDs and timestamps)
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the indexed entry log
	 */
	async getAuditLog(did: t.DidPlcString, options?: PlcRequestOptions): Promise<t.IndexedEntryLog> {
		const url = new URL(`/${encodeURIComponent(did)}/log/audit`, this.serviceUrl);

		const response = await this.#fetch(url, {
			signal: options?.signal,
			headers: { accept: 'application/json' },
		});

		const { json } = await handleIndexedEntryLog(response);
		return json;
	}

	/**
	 * fetches the last operation for a did:plc
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the last operation or tombstone
	 */
	async getLastOperation(
		did: t.DidPlcString,
		options?: PlcRequestOptions,
	): Promise<t.CompatibleOperationOrTombstone> {
		const url = new URL(`/${encodeURIComponent(did)}/log/last`, this.serviceUrl);

		const response = await this.#fetch(url, {
			signal: options?.signal,
			headers: { accept: 'application/json' },
		});

		const { json } = await handleLastOperation(response);
		return json;
	}

	/**
	 * submits a signed operation to plc.directory
	 * @param did the did:plc identifier
	 * @param operation the signed operation to submit
	 * @param options request options
	 */
	async submitOperation(
		did: t.DidPlcString,
		operation: t.OperationOrTombstone,
		options?: PlcRequestOptions,
	): Promise<void> {
		const url = new URL(`/${encodeURIComponent(did)}`, this.serviceUrl);

		const response = await this.#fetch(url, {
			method: 'POST',
			signal: options?.signal,
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(operation),
		});

		if (!response.ok) {
			throw new FailedResponseError(response);
		}
	}

	/**
	 * checks if the plc directory is reachable
	 * @param options request options
	 * @returns true if reachable
	 */
	async ping(options?: PlcRequestOptions): Promise<boolean> {
		const url = new URL('/_health', this.serviceUrl);

		const response = await this.#fetch(url, {
			signal: options?.signal,
		});

		return response.ok;
	}
}
