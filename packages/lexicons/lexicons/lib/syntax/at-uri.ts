import { isActorIdentifier, type ActorIdentifier } from './at-identifier.js';
import { isDid, type Did } from './did.js';
import { isNsid, type Nsid } from './nsid.js';
import { isRecordKey, type RecordKey } from './record-key.js';

import { type Result } from '../utils.js';

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

const ATURI_RE =
	/^at:\/\/([a-zA-Z0-9._:%-]+)(?:\/([a-zA-Z0-9-.]+)(?:\/([a-zA-Z0-9._~:@!$&%')(*+,;=-]+))?)?(?:#(\/[a-zA-Z0-9._~:@!$&%')(*+,;=\-[\]/\\]*))?$/;

// #__NO_SIDE_EFFECTS__
export const isResourceUri = (input: unknown): input is ResourceUri => {
	if (typeof input !== 'string') {
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

	const match = ATURI_RE.exec(input);
	if (match === null) {
		return false;
	}

	const [, r, c, k] = match;

	return isDid(r) && isNsid(c) && isRecordKey(k);
};

// #__NO_SIDE_EFFECTS__
export const parseCanonicalResourceUri = (input: string): Result<ParsedCanonicalResourceUri, string> => {
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
