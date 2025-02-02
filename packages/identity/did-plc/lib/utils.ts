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
