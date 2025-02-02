import * as v from '@badrap/valita';

import * as CID from '@atcute/cid';
import { parseDidKey } from '@atcute/crypto';

const DID_PLC_RE = /^did:plc:([a-z2-7]{24})$/;

export const didPlcString = v
	.string()
	.assert((input): input is `did:plc:${string}` => DID_PLC_RE.test(input), `must be a did:plc`);
export type DidPlcString = v.Infer<typeof didPlcString>;

export const didKeyString = v.string().chain((input) => {
	try {
		parseDidKey(input);
	} catch (err) {
		if (err instanceof SyntaxError) {
			return v.err(`did:key can't be parsed`);
		}

		return v.err(`invalid did:key`);
	}

	return v.ok(input as `did:key:${string}`);
});
export type DidKeyString = v.Infer<typeof didKeyString>;

const cidString = v.string().chain((input) => {
	try {
		CID.fromString(input);
	} catch {
		return v.err(`invalid cid`);
	}

	return v.ok(input);
});

export const unsignedLegacyCreateOperation = v.object({
	type: v.literal('create'),
	prev: v.null(),
	signingKey: didKeyString,
	recoveryKey: didKeyString,
	handle: v.string().assert((input) => input.length <= 256, `handle too long (max 256 characters)`),
	service: v
		.string()
		.assert((input) => input.length <= 512, `service endpoint too long (max 512 characters)`),
});
export type UnsignedLegacyCreateOperation = v.Infer<typeof unsignedLegacyCreateOperation>;

export const legacyCreateOperation = unsignedLegacyCreateOperation.extend({
	sig: v.string(),
});
export type LegacyCreateOperation = v.Infer<typeof legacyCreateOperation>;

const service = v.object({
	type: v.string().assert((input) => input.length <= 256, `service type too long (max 256 characters)`),
	endpoint: v
		.string()
		.assert((input) => input.length <= 512, `service endpoint too long (max 512 characters)`),
});

export const unsignedOperation = v.object({
	type: v.literal('plc_operation'),
	prev: v.string().nullable(),
	rotationKeys: v.array(didKeyString).chain((input) => {
		const length = input.length;

		if (length === 0) {
			return v.err(`missing rotation keys`);
		} else if (length > 10) {
			return v.err(`too many rotation keys (max 10 keys)`);
		}

		for (let i = 0; i < length; i++) {
			const key = input[i];

			for (let j = 0; j < i; j++) {
				if (input[j] === key) {
					return v.err({
						message: `duplicate "${key}" rotation key`,
						path: [i],
					});
				}
			}
		}

		return v.ok(input);
	}),
	verificationMethods: v.record(didKeyString).chain((input) => {
		for (const id in input) {
			if (id.length > 32) {
				return v.err({
					message: `verification method id too long (max 32 characters)`,
					path: [id],
				});
			}
		}

		return v.ok(input);
	}),
	alsoKnownAs: v
		.array(v.string().assert((input) => input.length <= 256, `aka entry too long (max 256 characters)`))
		.chain((input) => {
			const length = input.length;

			if (length > 10) {
				return v.err(`too many aka entries (max 10)`);
			}

			for (let i = 0; i < length; i++) {
				const aka = input[i];

				for (let j = 0; j < i; j++) {
					if (input[j] === aka) {
						return v.err({
							message: `duplicate "${aka}" aka entry`,
							path: [i],
						});
					}
				}
			}

			return v.ok(input);
		}),
	services: v.record(service).chain((input) => {
		const length = Object.keys(input).length;

		if (length > 10) {
			return v.err(`too many service entries (max 10)`);
		}

		for (const id in input) {
			if (id.length > 32) {
				return v.err({
					message: `service id too long (max 32 characters)`,
					path: [id],
				});
			}
		}

		return v.ok(input);
	}),
});
export type UnsignedOperation = v.Infer<typeof unsignedOperation>;

export const operation = unsignedOperation.extend({
	sig: v.string(),
});
export type Operation = v.Infer<typeof operation>;

export const unsignedTombstone = v.object({
	type: v.literal('plc_tombstone'),
	prev: v.string(),
});
export type UnsignedTombstone = v.Infer<typeof unsignedTombstone>;

export const tombstone = unsignedTombstone.extend({
	sig: v.string(),
});
export type Tombstone = v.Infer<typeof tombstone>;

export const compatibleOperation = v.union(operation, legacyCreateOperation);
export type CompatibleOperation = v.Infer<typeof compatibleOperation>;

export const compatibleOperationOrTombstone = v.union(operation, legacyCreateOperation, tombstone);
export type CompatibleOperationOrTombstone = v.Infer<typeof compatibleOperationOrTombstone>;

export const operationOrTombstone = v.union(operation, tombstone);
export type OperationOrTombstone = v.Infer<typeof operationOrTombstone>;

export const operationLog = v.tuple([compatibleOperation]).concat(v.array(operationOrTombstone));
export type OperationLog = v.Infer<typeof operationLog>;

export const indexedOperation = v.object({
	did: didPlcString,
	operation: compatibleOperationOrTombstone,
	cid: cidString,
	nullified: v.boolean(),
	createdAt: v.string().chain((input) => {
		const date = new Date(input);

		if (Number.isNaN(date.getTime())) {
			return v.err(`invalid timestamp`);
		}

		return v.ok(date);
	}),
});
export type IndexedOperation = v.Infer<typeof indexedOperation>;

const indexedOperationFirst = indexedOperation.extend({ operation: compatibleOperation });
const indexedOperationRest = indexedOperation.extend({ operation: operationOrTombstone });

export const indexedOperationLog = v.tuple([indexedOperationFirst]).concat(v.array(indexedOperationRest));
export type IndexedOperationLog = v.Infer<typeof indexedOperationLog>;
