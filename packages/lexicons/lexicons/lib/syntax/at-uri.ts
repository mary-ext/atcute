import { type Result } from '../utils.ts';

import { isActorIdentifier, type ActorIdentifier } from './at-identifier.ts';
import { isDid, type Did } from './did.ts';
import { isNsid, type Nsid } from './nsid.ts';
import { isRecordKey, type RecordKey } from './record-key.ts';
import { isAsciiAlphaNum } from './utils/ascii.ts';

/**
 * represents a general AT Protocol URI, representing either an entire
 * repository, a specific collection within a repository, or a record.
 *
 * it allows using handles over DIDs, but this means that it won't be stable.
 */
export type ResourceUri =
	| `at://${ActorIdentifier}`
	| `at://${ActorIdentifier}/${Nsid}`
	| `at://${ActorIdentifier}/${Nsid}/${RecordKey}`;

export type ParsedResourceUri =
	| { repo: ActorIdentifier; collection: undefined; rkey: undefined; fragment: string | undefined }
	| { repo: ActorIdentifier; collection: Nsid; rkey: undefined; fragment: string | undefined }
	| { repo: ActorIdentifier; collection: Nsid; rkey: RecordKey; fragment: string | undefined };

// minimum valid non-canonical at-uri is `at://a.a` (8 chars)
const AT_URI_MIN_LENGTH = 8;
// minimum canonical at-uri is `at://did:m:v/a.b.c/x` (20 chars)
const CANONICAL_AT_URI_MIN_LENGTH = 5 + 7 + 1 + 5 + 1 + 1;
// maximum structural length:
// `at://` + DID (2048) + `/` + NSID (317) + `/` + rkey (512)
const AT_URI_MAX_LENGTH = 5 + 2048 + 1 + 317 + 1 + 512;

// repo: [a-zA-Z0-9._:%-]
// collection: [a-zA-Z0-9.-]
// rkey: [a-zA-Z0-9._~:@!$&%')(*+,;=-]
// fragment: /[a-zA-Z0-9._~:@!$&%')(*+,;=\-[\]/\\]*
const ATURI_RE =
	/^at:\/\/([a-zA-Z0-9._:%-]+)(?:\/([a-zA-Z0-9-.]+)(?:\/([a-zA-Z0-9._~:@!$&%')(*+,;=-]+))?)?(?:#(\/[a-zA-Z0-9._~:@!$&%')(*+,;=\-[\]/\\]*))?$/;

const isFragmentChar = (c: number): boolean => {
	return (
		isAsciiAlphaNum(c) ||
		c === 0x2e || // .
		c === 0x5f || // _
		c === 0x7e || // ~
		c === 0x3a || // :
		c === 0x40 || // @
		c === 0x21 || // !
		c === 0x24 || // $
		c === 0x26 || // &
		c === 0x25 || // %
		c === 0x27 || // '
		c === 0x29 || // )
		c === 0x28 || // (
		c === 0x2a || // *
		c === 0x2b || // +
		c === 0x2c || // ,
		c === 0x3b || // ;
		c === 0x3d || // =
		c === 0x2d || // -
		c === 0x5b || // [
		c === 0x5d || // ]
		c === 0x2f || // /
		c === 0x5c // \
	);
};

// #__NO_SIDE_EFFECTS__
export const isResourceUri = (input: unknown): input is ResourceUri => {
	if (typeof input !== 'string') {
		return false;
	}

	const len = input.length;
	if (len < AT_URI_MIN_LENGTH || len > AT_URI_MAX_LENGTH) {
		return false;
	}

	if (
		input.charCodeAt(0) !== 0x61 ||
		input.charCodeAt(1) !== 0x74 ||
		input.charCodeAt(2) !== 0x3a ||
		input.charCodeAt(3) !== 0x2f ||
		input.charCodeAt(4) !== 0x2f
	) {
		return false;
	}

	const hash = input.indexOf('#', 5);
	const stop = hash === -1 ? len : hash;

	if (hash !== -1) {
		const fragmentStart = hash + 1;
		if (fragmentStart >= len || input.charCodeAt(fragmentStart) !== 0x2f) {
			return false;
		}

		for (let idx = fragmentStart; idx < len; idx++) {
			if (!isFragmentChar(input.charCodeAt(idx))) {
				return false;
			}
		}
	}

	const firstSlash = input.indexOf('/', 5);
	let repoEnd = stop;
	let collection: string | undefined;
	let rkey: string | undefined;

	if (firstSlash !== -1 && firstSlash < stop) {
		repoEnd = firstSlash;

		const collectionStart = firstSlash + 1;
		if (collectionStart >= stop) {
			return false;
		}

		const secondSlash = input.indexOf('/', collectionStart);
		if (secondSlash !== -1 && secondSlash < stop) {
			if (secondSlash === collectionStart || secondSlash + 1 >= stop) {
				return false;
			}

			const thirdSlash = input.indexOf('/', secondSlash + 1);
			if (thirdSlash !== -1 && thirdSlash < stop) {
				return false;
			}

			collection = input.substring(collectionStart, secondSlash);
			rkey = input.substring(secondSlash + 1, stop);
		} else {
			collection = input.substring(collectionStart, stop);
		}
	}

	if (repoEnd <= 5) {
		return false;
	}

	const repo = input.substring(5, repoEnd);

	return (
		isActorIdentifier(repo) &&
		(collection === undefined || isNsid(collection)) &&
		(rkey === undefined || isRecordKey(rkey))
	);
};

// #__NO_SIDE_EFFECTS__
export const parseResourceUri = (input: string): Result<ParsedResourceUri, string> => {
	const len = input.length;
	if (len < AT_URI_MIN_LENGTH || len > AT_URI_MAX_LENGTH) {
		return { ok: false, error: `invalid at-uri: ${input}` };
	}

	const match = ATURI_RE.exec(input);
	if (match === null) {
		return { ok: false, error: `invalid at-uri: ${input}` };
	}

	const [, r, c, k, f] = match;

	if (!isActorIdentifier(r)) {
		return { ok: false, error: `invalid repo in at-uri: ${r}` };
	}

	if (c !== undefined && !isNsid(c)) {
		return { ok: false, error: `invalid collection in at-uri: ${c}` };
	}

	if (k !== undefined && !isRecordKey(k)) {
		return { ok: false, error: `invalid rkey in at-uri: ${k}` };
	}

	return { ok: true, value: { repo: r, collection: c, rkey: k, fragment: f } };
};

/**
 * represents a canonical AT Protocol URI for a specific record.
 *
 * this URI format uses the account's DID as the authority, ensuring that
 * the URI remains valid even as the account changes handles, uniquely
 * identifying a specific piece of record within AT Protocol.
 */
export type CanonicalResourceUri = `at://${Did}/${Nsid}/${RecordKey}`;

export type ParsedCanonicalResourceUri = {
	repo: Did;
	collection: Nsid;
	rkey: RecordKey;
	fragment: string | undefined;
};

// #__NO_SIDE_EFFECTS__
export const isCanonicalResourceUri = (input: unknown): input is CanonicalResourceUri => {
	if (typeof input !== 'string') {
		return false;
	}

	const len = input.length;
	if (len < CANONICAL_AT_URI_MIN_LENGTH || len > AT_URI_MAX_LENGTH) {
		return false;
	}

	// must start with "at://"
	if (
		input.charCodeAt(0) !== 0x61 ||
		input.charCodeAt(1) !== 0x74 ||
		input.charCodeAt(2) !== 0x3a ||
		input.charCodeAt(3) !== 0x2f ||
		input.charCodeAt(4) !== 0x2f
	) {
		return false;
	}

	const firstSlash = input.indexOf('/', 5);
	if (firstSlash === -1) {
		return false;
	}

	const secondSlash = input.indexOf('/', firstSlash + 1);
	if (secondSlash === -1) {
		return false;
	}

	// check for fragment
	const hashPos = input.indexOf('#', secondSlash + 1);

	const repo = input.substring(5, firstSlash);
	const collection = input.substring(firstSlash + 1, secondSlash);
	const rkey = hashPos === -1 ? input.substring(secondSlash + 1) : input.substring(secondSlash + 1, hashPos);

	return isDid(repo) && isNsid(collection) && isRecordKey(rkey);
};

// #__NO_SIDE_EFFECTS__
export const parseCanonicalResourceUri = (input: string): Result<ParsedCanonicalResourceUri, string> => {
	const len = input.length;
	if (len < CANONICAL_AT_URI_MIN_LENGTH || len > AT_URI_MAX_LENGTH) {
		return { ok: false, error: `invalid canonical-at-uri: ${input}` };
	}

	const match = ATURI_RE.exec(input);
	if (match === null) {
		return { ok: false, error: `invalid canonical-at-uri: ${input}` };
	}

	const [, r, c, k, f] = match;

	if (!isDid(r)) {
		return { ok: false, error: `invalid repo in canonical-at-uri: ${r}` };
	}

	if (!isNsid(c)) {
		return { ok: false, error: `invalid collection in canonical-at-uri: ${c}` };
	}

	if (!isRecordKey(k)) {
		return { ok: false, error: `invalid rkey in canonical-at-uri: ${k}` };
	}

	return { ok: true, value: { repo: r, collection: c, rkey: k, fragment: f } };
};
