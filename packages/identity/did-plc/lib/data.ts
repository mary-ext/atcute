import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { isKeyDid } from '@atcute/identity';

import { DISPUTE_WINDOW } from './constants.js';
import * as err from './errors.js';
import * as t from './types.js';
import { deriveDidFromGenesisOp, isSignedOperationValid, normalizeOp } from './utils.js';

// soft constraint limits for incoming operations
const MAX_OP_BYTES = 4000;
const MAX_AKA_ENTRIES = 10;
const MAX_AKA_LENGTH = 258; // max handle length (253) plus at:// prefix (5)
const MAX_ROTATION_ENTRIES = 10;
const MAX_SERVICE_ENTRIES = 10;
const MAX_SERVICE_TYPE_LENGTH = 256;
const MAX_SERVICE_ENDPOINT_LENGTH = 512;
const MAX_VERIFICATION_METHOD_ENTRIES = 10;
const MAX_ID_LENGTH = 32;
const MAX_DID_KEY_LENGTH = 256; // k256 = 57, BLS12-381 = 143

/**
 * Validate an incoming operation against soft constraints (length limits, counts, duplicates).
 * This should be used when preparing to submit a new operation to plc.directory.
 * Historical operations should only be validated against hard constraints (structure, signatures, hashes).
 */
export const validateIncomingOp = (op: t.CompatibleOperationOrTombstone): void => {
	// Check CBOR size limit
	const byteLength = CBOR.encode(op).byteLength;
	if (byteLength > MAX_OP_BYTES) {
		throw new Error(`operation too large (${MAX_OP_BYTES} bytes maximum in cbor encoding)`);
	}

	if (op.type === 'plc_tombstone') {
		return;
	}

	op = normalizeOp(op);

	{
		const alsoKnownAs = op.alsoKnownAs;

		if (alsoKnownAs.length > MAX_AKA_ENTRIES) {
			throw new Error(`too many alsoKnownAs entries (max ${MAX_AKA_ENTRIES})`);
		}

		const alsoKnownAsDupe = new Set<string>();
		for (const aka of alsoKnownAs) {
			if (aka.length > MAX_AKA_LENGTH) {
				throw new Error(`alsoKnownAs entry too long (max ${MAX_AKA_LENGTH}): ${aka}`);
			}

			if (alsoKnownAsDupe.has(aka)) {
				throw new Error(`duplicate alsoKnownAs entry: ${aka}`);
			}

			alsoKnownAsDupe.add(aka);
		}
	}

	{
		const rotationKeys = op.rotationKeys;

		if (rotationKeys.length === 0) {
			throw new Error(`missing rotation keys`);
		}

		if (rotationKeys.length > MAX_ROTATION_ENTRIES) {
			throw new Error(`too many rotationKey entries (max ${MAX_ROTATION_ENTRIES})`);
		}

		const rotationKeyDupe = new Set<string>();
		for (const key of rotationKeys) {
			if (rotationKeyDupe.has(key)) {
				throw new Error(`duplicate rotation key: ${key}`);
			}
			rotationKeyDupe.add(key);
		}
	}

	{
		const services = Object.entries(op.services);

		if (services.length > MAX_SERVICE_ENTRIES) {
			throw new Error(`too many service entries (max ${MAX_SERVICE_ENTRIES})`);
		}

		for (const [id, service] of services) {
			if (id.length > MAX_ID_LENGTH) {
				throw new Error(`service id too long (max ${MAX_ID_LENGTH}): ${id}`);
			}

			if (service.type.length > MAX_SERVICE_TYPE_LENGTH) {
				throw new Error(`service type too long (max ${MAX_SERVICE_TYPE_LENGTH})`);
			}

			if (service.endpoint.length > MAX_SERVICE_ENDPOINT_LENGTH) {
				throw new Error(`service endpoint too long (max ${MAX_SERVICE_ENDPOINT_LENGTH})`);
			}
		}
	}

	{
		const verificationMethods = Object.entries(op.verificationMethods);

		if (verificationMethods.length > MAX_VERIFICATION_METHOD_ENTRIES) {
			throw new Error(`too many verification method entries (max ${MAX_VERIFICATION_METHOD_ENTRIES})`);
		}

		for (const [id, key] of verificationMethods) {
			if (id.length > MAX_ID_LENGTH) {
				throw new Error(`verification method id too long (max ${MAX_ID_LENGTH}): ${id}`);
			}

			if (key.length > MAX_DID_KEY_LENGTH) {
				throw new Error(`verification method key too long (max ${MAX_DID_KEY_LENGTH}): ${key}`);
			}

			if (!isKeyDid(key)) {
				throw new Error(`invalid verification method key: ${key}`);
			}
		}
	}
};

/**
 * Process an indexed entry by validating it and integrating it into the canonical log.
 */
export const processIndexedEntry = async (
	did: t.DidPlcString,
	canonical: t.IndexedEntryWithSigner[],
	proposed: t.IndexedEntry,
): Promise<{
	prev: string | null;
	ops: t.IndexedEntryWithSigner[];
	nullified: t.IndexedEntryWithSigner[];
}> => {
	if (canonical.length === 0) {
		if (proposed.operation.type === 'plc_tombstone') {
			throw new err.ImproperOperationError(proposed, `expected genesis op to not be tombstone`);
		}

		if (proposed.operation.prev !== null) {
			throw new err.ImproperOperationError(proposed, `expected null prev on genesis op`);
		}

		// Check if CID and DID matches
		{
			const expectedDid = await deriveDidFromGenesisOp(proposed.operation);
			if (expectedDid !== did) {
				throw new err.GenesisHashError(proposed, did);
			}

			const opBytes = CBOR.encode(proposed.operation);
			const expectedCid = CID.toString(await CID.create(CID.CODEC_DCBOR, opBytes));
			if (expectedCid !== proposed.cid) {
				throw new err.InvalidHashError(proposed, expectedCid);
			}
		}

		// Check if signature is valid
		let allowedSigners: t.DidKeyString[];
		let signedBy: t.DidKeyString;

		{
			const { rotationKeys } = normalizeOp(proposed.operation);
			const ok = await isSignedOperationValid(rotationKeys, proposed.operation);

			if (!ok) {
				throw new err.InvalidSignatureError(proposed);
			}

			allowedSigners = rotationKeys;
			signedBy = ok;
		}

		return {
			prev: null,
			nullified: [],
			ops: [{ ...proposed, allowedSigners, signedBy }],
		};
	}

	// Grab the previous reference
	const proposedPrev = proposed.operation.prev;
	if (!proposedPrev) {
		throw new err.ImproperOperationError(proposed, `expected prev op`);
	}

	const indexOfPrev = canonical.findIndex((op) => op.cid === proposedPrev);
	if (indexOfPrev === -1) {
		throw new err.ImproperOperationError(proposed, `prev op not in history`);
	}

	// Check if the CID matches
	{
		const opBytes = CBOR.encode(proposed.operation);
		const expectedCid = CID.toString(await CID.create(CID.CODEC_DCBOR, opBytes));
		if (expectedCid !== proposed.cid) {
			throw new err.InvalidHashError(proposed, expectedCid);
		}
	}

	// Get the proposed canonical history
	const alteredHistory = canonical.slice(0, indexOfPrev + 1);

	const nullified = canonical.slice(indexOfPrev + 1);
	const lastOp = alteredHistory.at(-1);

	if (!lastOp) {
		throw new err.ImproperOperationError(proposed, `missing last op`);
	}
	if (lastOp.operation.type === 'plc_tombstone') {
		throw new err.ImproperOperationError(proposed, `did is tombstoned`);
	}

	const lastOpNormalized = normalizeOp(lastOp.operation);
	const firstNullified = nullified[0];

	// We're not nullifying, check if the signature is valid and move on
	if (!firstNullified) {
		const allowedSigners = lastOpNormalized.rotationKeys;
		const signedBy = await isSignedOperationValid(allowedSigners, proposed.operation);
		if (!signedBy) {
			throw new err.InvalidSignatureError(proposed);
		}

		return {
			prev: proposedPrev,
			nullified: [],
			ops: [...canonical, { ...proposed, allowedSigners, signedBy }],
		};
	}

	// The indexed log should say that all of the nullified has `nullified: true`
	// for (let idx = 0, len = nullified.length; idx < len; idx++) {
	// 	const op = nullified[idx];

	// 	if (!op.nullified) {
	// 		throw new err.ImproperOperationError(op, `expected nullified prop to be true`);
	// 	}
	// }

	// Check if operation within the recovery window
	{
		const lapsed = new Date(proposed.createdAt).getTime() - new Date(firstNullified.createdAt).getTime();

		if (lapsed > DISPUTE_WINDOW) {
			throw new err.LateDisputeError(proposed, lapsed);
		}
	}

	// Check if the dispute is valid
	{
		let allowedSigners: t.DidKeyString[];
		let signedBy: t.DidKeyString;

		{
			const disputedSigner = firstNullified.signedBy;

			const indexOfSigner = lastOpNormalized.rotationKeys.indexOf(disputedSigner);
			const morePowerfulKeys = lastOpNormalized.rotationKeys.slice(0, indexOfSigner);

			const ok = await isSignedOperationValid(morePowerfulKeys, proposed.operation);
			if (!ok) {
				throw new err.InvalidSignatureError(proposed);
			}

			allowedSigners = morePowerfulKeys;
			signedBy = ok;
		}

		return {
			prev: proposedPrev,
			nullified: nullified,
			ops: [...alteredHistory, { ...proposed, allowedSigners, signedBy }],
		};
	}
};

/**
 * Process an indexed entry log by sequentially processing each operation.
 */
export const processIndexedEntryLog = async (
	did: t.DidPlcString,
	ops: t.IndexedEntryLog,
): Promise<{ canonical: t.IndexedEntryWithSigner[]; nullified: t.IndexedEntryWithSigner[] }> => {
	let nullified: t.IndexedEntryWithSigner[] = [];
	let canonical: t.IndexedEntryWithSigner[] = [];

	for (const operation of ops) {
		const result = await processIndexedEntry(did, canonical, operation);
		canonical = result.ops;

		if (result.nullified.length > 0) {
			nullified = nullified.concat(result.nullified);
		}
	}

	return { canonical, nullified };
};

/**
 * Check whether an operation can still be disputed
 */
export const isDisputePeriodActive = (disputed: t.IndexedEntry, now = Date.now()): boolean => {
	const lapsed = now - new Date(disputed.createdAt).getTime();
	return lapsed <= DISPUTE_WINDOW;
};

/**
 * Check if a key is authorized to dispute an operation
 */
export const isAuthorizedForDispute = (
	base: t.IndexedEntryWithSigner<t.CompatibleOperation>,
	disputed: t.IndexedEntryWithSigner,
	key: t.DidKeyString,
): boolean => {
	const { rotationKeys } = normalizeOp(base.operation);

	const disputedSigner = disputed.signedBy;
	const disputedIndex = rotationKeys.indexOf(disputedSigner);
	if (disputedIndex === -1) {
		return false;
	}

	const didKeyIndex = rotationKeys.indexOf(key);
	return didKeyIndex !== -1 && didKeyIndex < disputedIndex;
};

export interface DisputeCandidate {
	base: t.IndexedEntryWithSigner<t.CompatibleOperation>;
	disputed: t.IndexedEntryWithSigner;
}

/**
 * Finds operations that can be disputed by a given key
 */
export const getDisputeCandidates = (canonical: t.IndexedEntryWithSigner[], key: t.DidKeyString) => {
	const candidates: DisputeCandidate[] = [];
	const now = Date.now();

	for (let idx = 1, len = canonical.length; idx < len; idx++) {
		const base = canonical[idx - 1] as t.IndexedEntryWithSigner<t.CompatibleOperation>;
		const disputed = canonical[idx];

		// Only consider if it's still within the recovery window.
		if (!isDisputePeriodActive(disputed, now)) {
			continue;
		}

		// Check if the provided key is allowed to dispute this operation.
		if (isAuthorizedForDispute(base, disputed, key)) {
			candidates.push({ base, disputed });
		}
	}

	return candidates;
};
