import { type Result } from '../utils.ts';

import { isActorIdentifier, type ActorIdentifier } from './at-identifier.ts';
import { isDid, type Did } from './did.ts';
import { isNsid, type Nsid } from './nsid.ts';
import { isRecordKey, type RecordKey } from './record-key.ts';

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

// #__NO_SIDE_EFFECTS__
export const isResourceUri = (input: unknown): input is ResourceUri => {
	if (typeof input !== 'string') {
		return false;
	}

	const len = input.length;
	if (len < AT_URI_MIN_LENGTH || len > AT_URI_MAX_LENGTH) {
		return false;
	}

	const match = ATURI_RE.exec(input);
	if (match === null) {
		return false;
	}

	const [, r, c, k] = match;

	return isActorIdentifier(r) && (c === undefined || isNsid(c)) && (k === undefined || isRecordKey(k));
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
