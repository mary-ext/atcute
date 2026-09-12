import { type DidDocument, defs as identityDefs } from '@atcute/identity';
import { parseResponseAsJson, pipe, validateJsonWith } from '@atcute/util-fetch';

import * as defs from './typedefs.ts';
import type * as t from './types.ts';

const MAX_RESPONSE_SIZE = 64 * 1024;

export interface PlcErrorBody {
	message: string;
}

/** error thrown when the plc server returns a non-ok response */
export class PlcClientError extends Error {
	override readonly name = 'PlcClientError';

	status: number;
	body: PlcErrorBody | null;

	constructor(status: number, body: PlcErrorBody | null, message: string) {
		super(message);
		this.status = status;
		this.body = body;
	}

	/**
	 * creates a PlcClientError from a failed fetch response
	 *
	 * @param response the failed response
	 * @returns the error with parsed body if available
	 */
	static async fromResponse(response: Response): Promise<PlcClientError> {
		const status = response.status;
		let body: PlcErrorBody | null = null;
		let message = `got http ${status}`;

		try {
			const text = await response.text();
			const json = JSON.parse(text);

			if (typeof json.message === 'string') {
				body = { message: json.message };
				message = json.message;
			}
		} catch {
			// failed to parse response body, use default message
		}

		return new PlcClientError(status, body, message);
	}
}

const assertResponseOk = async (response: Response): Promise<Response> => {
	if (response.ok) {
		return response;
	}
	throw await PlcClientError.fromResponse(response);
};

const handleDocument = pipe(
	assertResponseOk,
	parseResponseAsJson(/^application\/(?:did\+json|did\+ld\+json|json)$/, MAX_RESPONSE_SIZE),
	validateJsonWith(identityDefs.didDocument),
);

const handlePlcState = pipe(
	assertResponseOk,
	parseResponseAsJson(/^application\/json$/, MAX_RESPONSE_SIZE),
	validateJsonWith(defs.plcState),
);

const handleOperationLog = pipe(
	assertResponseOk,
	parseResponseAsJson(/^application\/json$/, MAX_RESPONSE_SIZE),
	validateJsonWith(defs.operationLog),
);

const handleIndexedEntryLog = pipe(
	assertResponseOk,
	parseResponseAsJson(/^application\/json$/, MAX_RESPONSE_SIZE),
	validateJsonWith(defs.indexedEntryLog),
);

const handleLastOperation = pipe(
	assertResponseOk,
	parseResponseAsJson(/^application\/json$/, MAX_RESPONSE_SIZE),
	validateJsonWith(defs.compatibleOperationOrTombstone),
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

/** client for interacting with plc.directory */
export class PlcClient {
	readonly serviceUrl: string;
	#fetch: typeof globalThis.fetch;

	constructor({ serviceUrl = 'https://plc.directory', fetch: fetchFn = fetch }: PlcClientOptions = {}) {
		this.serviceUrl = serviceUrl;
		this.#fetch = fetchFn;
	}

	/**
	 * fetches the DID document for a did:plc
	 *
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the DID document
	 */
	async getDocument(did: t.DidPlcString, options?: PlcRequestOptions): Promise<DidDocument> {
		const url = new URL(`/${encodeURIComponent(did)}`, this.serviceUrl);

		const response = await (0, this.#fetch)(url, {
			signal: options?.signal,
			headers: { accept: 'application/did+ld+json,application/did+json,application/json' },
		});

		const { json } = await handleDocument(response);
		return json;
	}

	/**
	 * fetches the current identity state for a did:plc
	 *
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the current plc state
	 */
	async getState(did: t.DidPlcString, options?: PlcRequestOptions): Promise<t.PlcState> {
		const url = new URL(`/${encodeURIComponent(did)}/data`, this.serviceUrl);

		const response = await (0, this.#fetch)(url, {
			signal: options?.signal,
			headers: { accept: 'application/json' },
		});

		const { json } = await handlePlcState(response);
		return json;
	}

	/**
	 * fetches the operation log for a did:plc
	 *
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the operation log
	 */
	async getOperationLog(did: t.DidPlcString, options?: PlcRequestOptions): Promise<t.OperationLog> {
		const url = new URL(`/${encodeURIComponent(did)}/log`, this.serviceUrl);

		const response = await (0, this.#fetch)(url, {
			signal: options?.signal,
			headers: { accept: 'application/json' },
		});

		const { json } = await handleOperationLog(response);
		return json;
	}

	/**
	 * fetches the auditable log for a did:plc (includes CIDs and timestamps)
	 *
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the indexed entry log
	 */
	async getAuditLog(did: t.DidPlcString, options?: PlcRequestOptions): Promise<t.IndexedEntryLog> {
		const url = new URL(`/${encodeURIComponent(did)}/log/audit`, this.serviceUrl);

		const response = await (0, this.#fetch)(url, {
			signal: options?.signal,
			headers: { accept: 'application/json' },
		});

		const { json } = await handleIndexedEntryLog(response);
		return json;
	}

	/**
	 * fetches the last operation for a did:plc
	 *
	 * @param did the did:plc identifier
	 * @param options request options
	 * @returns the last operation or tombstone
	 */
	async getLastOperation(
		did: t.DidPlcString,
		options?: PlcRequestOptions,
	): Promise<t.CompatibleOperationOrTombstone> {
		const url = new URL(`/${encodeURIComponent(did)}/log/last`, this.serviceUrl);

		const response = await (0, this.#fetch)(url, {
			signal: options?.signal,
			headers: { accept: 'application/json' },
		});

		const { json } = await handleLastOperation(response);
		return json;
	}

	/**
	 * submits a signed operation to plc.directory
	 *
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

		const response = await (0, this.#fetch)(url, {
			method: 'POST',
			signal: options?.signal,
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(operation),
		});

		if (!response.ok) {
			throw await PlcClientError.fromResponse(response);
		}
	}

	/**
	 * checks if the plc directory is reachable
	 *
	 * @param options request options
	 * @returns true if reachable
	 */
	async ping(options?: PlcRequestOptions): Promise<boolean> {
		const url = new URL('/_health', this.serviceUrl);

		try {
			const response = await (0, this.#fetch)(url, {
				signal: options?.signal,
			});

			return response.ok;
		} catch {
			return false;
		}
	}
}
