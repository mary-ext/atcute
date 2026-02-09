import { defs as identityDefs, type DidDocument } from '@atcute/identity';
import type { Did } from '@atcute/lexicons';

import { TapSubscription } from './tap-subscription.ts';
import { repoInfoSchema } from './typedefs.ts';
import type { RepoInfo, TapClientOptions, TapSubscribeOptions } from './types.ts';
import { formatAdminAuthHeader } from './utils.ts';

export class TapClient {
	#url: URL;
	#fetch: typeof globalThis.fetch;
	#adminPassword?: string;
	#authHeader?: string;

	constructor(options: TapClientOptions) {
		const url = typeof options.url === 'string' ? new URL(options.url) : new URL(options.url);

		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			throw new Error(`invalid url protocol, expected http: or https:, got ${url.protocol}`);
		}

		this.#url = url;
		this.#fetch = options.fetch ?? fetch;

		if (options.adminPassword) {
			this.#adminPassword = options.adminPassword;
			this.#authHeader = formatAdminAuthHeader(options.adminPassword);
		}
	}

	subscribe(options?: TapSubscribeOptions): TapSubscription {
		const wsUrl = new URL(this.#url);
		wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
		wsUrl.pathname = '/channel';

		return new TapSubscription({
			url: wsUrl.toString(),
			adminPassword: this.#adminPassword,
			...options,
		});
	}

	async addRepos(dids: Did[]): Promise<void> {
		const response = await this.#fetch(new URL('/repos/add', this.#url), {
			method: 'POST',
			headers: this.#getHeaders(),
			body: JSON.stringify({ dids }),
		});

		await response.body?.cancel();
		if (!response.ok) {
			throw new Error(`failed to add repos: ${response.status} ${response.statusText}`);
		}
	}

	async removeRepos(dids: Did[]): Promise<void> {
		const response = await this.#fetch(new URL('/repos/remove', this.#url), {
			method: 'POST',
			headers: this.#getHeaders(),
			body: JSON.stringify({ dids }),
		});

		await response.body?.cancel();
		if (!response.ok) {
			throw new Error(`failed to remove repos: ${response.status} ${response.statusText}`);
		}
	}

	async resolveDid(did: Did): Promise<DidDocument | null> {
		const response = await this.#fetch(new URL(`/resolve/${did}`, this.#url), {
			method: 'GET',
			headers: this.#getHeaders(),
		});

		if (response.status === 404) {
			await response.body?.cancel();
			return null;
		}

		if (!response.ok) {
			await response.body?.cancel();
			throw new Error(`failed to resolve did: ${response.status} ${response.statusText}`);
		}

		return identityDefs.didDocument.parse(await response.json());
	}

	async getRepoInfo(did: Did): Promise<RepoInfo> {
		const response = await this.#fetch(new URL(`/info/${did}`, this.#url), {
			method: 'GET',
			headers: this.#getHeaders(),
		});

		if (!response.ok) {
			await response.body?.cancel();
			throw new Error(`failed to get repo info: ${response.status} ${response.statusText}`);
		}

		return repoInfoSchema.parse(await response.json());
	}

	#getHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (this.#authHeader) {
			headers['Authorization'] = this.#authHeader;
		}

		return headers;
	}
}
