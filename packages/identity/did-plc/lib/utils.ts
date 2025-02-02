import * as CBOR from '@atcute/cbor';
import { verifySigWithDidKey } from '@atcute/crypto';
import { fromBase64Url } from '@atcute/multibase';

import * as t from './types.js';

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
