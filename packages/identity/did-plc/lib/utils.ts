import * as CBOR from '@atcute/cbor';
import type { PrivateKey } from '@atcute/crypto';
import { verifySigWithDidKey } from '@atcute/crypto';
import { fromBase64Url, toBase32, toBase64Url } from '@atcute/multibase';
import { toSha256 } from '@atcute/uint8array';

import * as t from './types.ts';

export const wrapHttpPrefix = (str: string): string => {
	if (str.startsWith('http://') || str.startsWith('https://')) {
		return str;
	}

	return `https://${str}`;
};

export const wrapAtprotoPrefix = (str: string): string => {
	if (str.startsWith('at://')) {
		return str;
	}

	const stripped = str.replace('http://', '').replace('https://', '');

	return `at://${stripped}`;
};

/**
 * derives the did:plc identifier from a genesis operation
 * @param op signed genesis operation
 * @returns the did:plc string
 */
export const deriveDidFromGenesisOp = async (op: t.CompatibleOperation): Promise<t.DidPlcString> => {
	const opBytes = CBOR.encode(op);
	const hash = await toSha256(opBytes);
	return `did:plc:${toBase32(hash.subarray(0, 15))}`;
};

export const normalizeOp = (op: t.CompatibleOperation): t.Operation => {
	if (op.type === 'create') {
		return {
			type: 'plc_operation',
			prev: op.prev,
			sig: op.sig,
			rotationKeys: [op.recoveryKey, op.signingKey],
			verificationMethods: {
				atproto: op.signingKey,
			},
			alsoKnownAs: [wrapAtprotoPrefix(op.handle)],
			services: {
				atproto_pds: {
					type: 'AtprotoPersonalDataServer',
					endpoint: wrapHttpPrefix(op.service),
				},
			},
		};
	}

	return op;
};

export const isSignedOperationValid = async (
	allowedKeys: t.DidKeyString[],
	op: t.CompatibleOperationOrTombstone,
): Promise<t.DidKeyString | null> => {
	const { sig, ...unsignedOp } = op;

	const sigBytes = fromBase64Url(sig);
	const opBytes = CBOR.encode(unsignedOp);

	for (const key of allowedKeys) {
		const ok = await verifySigWithDidKey(key, sigBytes, opBytes);

		if (ok) {
			return key;
		}
	}

	return null;
};

// #region signing operations

/**
 * signs an unsigned plc operation
 * @param op unsigned operation to sign
 * @param key private key to sign with (must be one of the rotation keys)
 * @returns signed operation
 */
export const signOperation = async (op: t.UnsignedOperation, key: PrivateKey): Promise<t.Operation> => {
	const data = CBOR.encode(op);
	const sig = await key.sign(data);

	return { ...op, sig: toBase64Url(sig) };
};

/**
 * signs an unsigned plc tombstone
 * @param op unsigned tombstone to sign
 * @param key private key to sign with (must be one of the rotation keys)
 * @returns signed tombstone
 */
export const signTombstone = async (op: t.UnsignedTombstone, key: PrivateKey): Promise<t.Tombstone> => {
	const data = CBOR.encode(op);
	const sig = await key.sign(data);

	return { ...op, sig: toBase64Url(sig) };
};

// #endregion
