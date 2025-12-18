import type { AtprotoAudience, Nsid } from '@atcute/lexicons/syntax';

/** repo record actions */
export type RepoAction = 'create' | 'update' | 'delete';

/** account attributes */
export type AccountAttr = 'email' | 'repo' | 'status';

/** account actions */
export type AccountAction = 'read' | 'manage';

/** identity attributes */
export type IdentityAttr = 'handle' | '*';

/** collection parameter - NSID or wildcard */
export type CollectionParam = Nsid | '*';

/** lexicon method parameter - NSID or wildcard */
export type LxmParam = Nsid | '*';

/** audience parameter - atproto audience or wildcard */
export type AudParam = AtprotoAudience | '*';

export interface RepoOptions {
	/** collection NSID(s) or '*' for all */
	collection: CollectionParam[];
	/** allowed actions; if omitted, all operations are permitted */
	action?: RepoAction[];
}

/**
 * builds a repo permission scope
 * @param options repo permission options
 * @returns scope string like `repo?collection=app.bsky.feed.post&action=create&action=update`
 */
export const repo = (options: RepoOptions): string => {
	const { collection, action = [] } = options;

	const params = new URLSearchParams();
	for (const c of collection) {
		params.append('collection', c);
	}

	for (const a of action) {
		params.append('action', a);
	}

	return formatScope('repo', params);
};

export interface RpcOptions {
	/** lexicon method NSID(s) or '*' for all */
	lxm: LxmParam[];
	/** audience */
	aud: AudParam;
}

/**
 * builds an rpc permission scope
 * @param options rpc permission options
 * @returns scope string like `rpc?lxm=app.bsky.feed.getFeed&aud=*`
 */
export const rpc = (options: RpcOptions): string => {
	const { lxm, aud } = options;

	const params = new URLSearchParams();
	params.set('aud', aud);

	for (const l of lxm) {
		params.append('lxm', l);
	}

	return formatScope('rpc', params);
};

export interface AccountOptions {
	/** account attribute (email, repo, status) */
	attr: AccountAttr;
	/** action (read or manage); defaults to read */
	action?: AccountAction;
}

/**
 * builds an account permission scope
 * @param options account permission options
 * @returns scope string like `account?attr=email` or `account?attr=email&action=manage`
 */
export const account = (options: AccountOptions): string => {
	const { attr, action } = options;

	const params = new URLSearchParams();
	params.set('attr', attr);

	if (action !== undefined) {
		params.set('action', action);
	}

	return formatScope('account', params);
};

export interface BlobOptions {
	/** MIME type(s) to accept (e.g., 'image/*', '*\/*') */
	accept: string[];
}

/**
 * builds a blob permission scope
 * @param options blob permission options
 * @returns scope string like `blob?accept=image/*`
 */
export const blob = (options: BlobOptions): string => {
	const { accept } = options;

	const params = new URLSearchParams();

	for (const a of accept) {
		params.append('accept', a);
	}

	return formatScope('blob', params);
};

export interface IdentityOptions {
	/** identity attribute ('handle' or '*') */
	attr: IdentityAttr;
}

/**
 * builds an identity permission scope
 * @param options identity permission options
 * @returns scope string like `identity?attr=handle`
 */
export const identity = (options: IdentityOptions): string => {
	const params = new URLSearchParams();
	params.set('attr', options.attr);

	return formatScope('identity', params);
};

export interface IncludeOptions {
	/** lexicon NSID */
	nsid: Nsid;
	/** optional audience override */
	aud?: AtprotoAudience;
}

/**
 * builds an include scope for lexicon-defined permission sets
 * @param options include scope options
 * @returns scope string like `include?nsid=app.bsky.permissions&aud=did:web:bsky.app%23appview`
 */
export const include = (options: IncludeOptions): string => {
	const { nsid, aud } = options;

	const params = new URLSearchParams();
	params.set('nsid', nsid);

	if (aud !== undefined) {
		params.set('aud', aud);
	}

	return formatScope('include', params);
};

// characters that should remain unencoded in scope strings
const ALLOWED_CHARS = new Set([':', '/', '+', ',', '@', '%']);

// format a scope string matching atproto oauth-scopes format
const formatScope = (prefix: string, params: URLSearchParams): string => {
	if (params.size === 0) {
		return prefix;
	}

	return `${prefix}?${normalizeEncoding(params.toString())}`;
};

// normalize URL encoding to match atproto format
// keeps : / + , @ unencoded, but # must stay as %23
const normalizeEncoding = (value: string): string => {
	return value.replace(/%[0-9A-F]{2}/gi, (match) => {
		const char = decodeURIComponent(match);
		if (ALLOWED_CHARS.has(char)) {
			return char;
		}
		return match.toUpperCase();
	});
};
