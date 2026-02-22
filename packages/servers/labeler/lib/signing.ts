import type * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import { encode, toBytes } from '@atcute/cbor';
import type { PrivateKey } from '@atcute/crypto';
import type { Did } from '@atcute/lexicons/syntax';

import type { ApplyLabelsOptions, LabelOp, SignedLabel } from './types.ts';

type UnsignedLabel = Omit<ComAtprotoLabelDefs.Label, 'sig'> & {
	sig?: undefined;
};

export const signLabel = async (key: PrivateKey, label: UnsignedLabel): Promise<SignedLabel> => {
	const sig = await key.sign(encode(label));

	return {
		...label,
		sig: toBytes(sig),
	};
};

const toUnsignedLabel = (
	op: LabelOp,
	opts: { serviceDid: Did; issuedAt: string; expiresAt: string | undefined; negate: boolean },
): UnsignedLabel => {
	return {
		cid: op.cid,
		cts: op.issuedAt ?? opts.issuedAt,
		exp: op.expiresAt ?? opts.expiresAt,
		neg: opts.negate ? true : undefined,
		src: opts.serviceDid,
		uri: op.uri,
		val: op.value,
		ver: 1,
	};
};

export const buildLabels = (
	serviceDid: Did,
	ops: Iterable<LabelOp>,
	defaults: ApplyLabelsOptions = {},
): UnsignedLabel[] => {
	const labels: UnsignedLabel[] = [];

	const issuedAt = defaults.issuedAt ?? new Date().toISOString();
	const expiresAt = defaults.expiresAt;

	for (const op of ops) {
		labels.push(
			toUnsignedLabel(op, {
				serviceDid: serviceDid,
				issuedAt: issuedAt,
				expiresAt: expiresAt,
				negate: op.negate === true,
			}),
		);
	}

	return labels;
};
