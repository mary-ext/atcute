import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { toBase32 } from '@atcute/multibase';
import { toSha256 } from '@atcute/uint8array';

import { RECOVERY_WINDOW } from './constants.js';
import * as err from './errors.js';
import * as t from './types.js';
import { isSignedOperationValid, normalizeOp } from './utils.js';

export const validateIndexedEntry = async (
	did: t.DidPlcString,
	history: t.IndexedEntryWithSigner[],
	proposed: t.IndexedEntry,
): Promise<{
	prev: string | null;
	ops: t.IndexedEntryWithSigner[];
	nullified: t.IndexedEntryWithSigner[];
}> => {
	if (history.length === 0) {
		if (proposed.operation.type === 'plc_tombstone') {
			throw new err.ImproperOperationError(proposed, `expected genesis op to not be tombstone`);
		}

		if (proposed.operation.prev !== null) {
			throw new err.ImproperOperationError(proposed, `expected null prev on genesis op`);
		}

		// Check if CID and DID matches
		{
			const opBytes = CBOR.encode(proposed.operation);

			const expectedDid = `did:plc:${toBase32(await toSha256(opBytes)).slice(0, 24)}`;
			if (expectedDid !== did) {
				throw new err.GenesisHashError(proposed, did);
			}

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
			nullified: [],
			prev: null,
			ops: [{ ...proposed, allowedSigners, signedBy }],
		};
	}

	// Grab the previous reference
	const proposedPrev = proposed.operation.prev;
	if (!proposedPrev) {
		throw new err.ImproperOperationError(proposed, `expected prev op`);
	}

	const indexOfPrev = history.findIndex((op) => op.cid === proposedPrev);
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
	const alteredHistory = history.slice(0, indexOfPrev + 1);

	const nullified = history.slice(indexOfPrev + 1);
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
			nullified: [],
			prev: proposedPrev,
			ops: [...history, { ...proposed, allowedSigners, signedBy }],
		};
	}

	// The indexed log should say that all of the nullified has `nullified: true`
	for (let idx = 0, len = nullified.length; idx < len; idx++) {
		const op = nullified[idx];

		if (!op.nullified) {
			throw new err.ImproperOperationError(op, `expected nullified prop to be true`);
		}
	}

	// Check if operation within the recovery window
	{
		const lapsed = new Date(proposed.createdAt).getTime() - new Date(firstNullified.createdAt).getTime();

		if (lapsed > RECOVERY_WINDOW) {
			throw new err.LateRecoveryError(proposed, lapsed);
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
			nullified: nullified,
			prev: proposedPrev,
			ops: [...alteredHistory, { ...proposed, allowedSigners, signedBy }],
		};
	}
};

/**
 * Validate the logs returned from `/<did_identifier>/log/audit`
 */
export const validateIndexedEntryLog = async (
	did: t.DidPlcString,
	ops: t.IndexedEntryLog,
): Promise<{ canonical: t.IndexedEntryWithSigner[]; nullified: t.IndexedEntryWithSigner[] }> => {
	let nullified: t.IndexedEntryWithSigner[] = [];
	let canonical: t.IndexedEntryWithSigner[] = [];

	for (const operation of ops) {
		const result = await validateIndexedEntry(did, canonical, operation);
		canonical = result.ops;

		if (result.nullified.length > 0) {
			nullified = nullified.concat(result.nullified);
		}
	}

	return { canonical, nullified };
};
