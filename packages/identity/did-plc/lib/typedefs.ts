import * as CID from '@atcute/cid';
import { parseDidKey } from '@atcute/crypto';
import { isKeyDid, isPlcDid } from '@atcute/identity';

import * as v from 'valibot';

import * as t from './types.ts';

// #region Strings
export const didPlcString = v.custom<t.DidPlcString>(isPlcDid, `must be a did:plc`);

export const permissiveDidKeyString = v.custom<t.DidKeyString>(isKeyDid, `must be a did:key`);

export const didKeyString = v.custom<t.DidKeyString>((input) => {
	if (!isKeyDid(input)) {
		return false;
	}
	try {
		parseDidKey(input);
		return true;
	} catch {
		return false;
	}
}, `invalid did:key`);

const cidString = v.pipe(
	v.string(),
	v.check((input) => {
		try {
			CID.fromString(input);
			return true;
		} catch {
			return false;
		}
	}, `invalid cid`),
);
// #endregion

// #region create
const unsignedLegacyCreateOperationEntries = {
	type: v.literal('create'),
	prev: v.null(),
	signingKey: didKeyString,
	recoveryKey: didKeyString,
	handle: v.string(),
	service: v.string(),
};

export const unsignedLegacyCreateOperation: v.GenericSchema<unknown, t.UnsignedLegacyCreateOperation> =
	v.looseObject(unsignedLegacyCreateOperationEntries);

export const legacyCreateOperation: v.GenericSchema<unknown, t.LegacyCreateOperation> = v.looseObject({
	...unsignedLegacyCreateOperationEntries,
	sig: v.string(),
});
// #endregion

// #region plc_operation
export const service: v.GenericSchema<unknown, t.Service> = v.looseObject({
	type: v.string(),
	endpoint: v.string(),
});

const unsignedOperationEntries = {
	type: v.literal('plc_operation'),
	prev: v.nullable(v.string()),
	rotationKeys: v.array(didKeyString),
	verificationMethods: v.record(v.string(), permissiveDidKeyString),
	alsoKnownAs: v.array(v.string()),
	services: v.record(v.string(), service),
};

export const unsignedOperation: v.GenericSchema<unknown, t.UnsignedOperation> =
	v.looseObject(unsignedOperationEntries);

export const operation: v.GenericSchema<unknown, t.Operation> = v.looseObject({
	...unsignedOperationEntries,
	sig: v.string(),
});
// #endregion

// #region plc_tombstone
const unsignedTombstoneEntries = {
	type: v.literal('plc_tombstone'),
	prev: v.string(),
};

export const unsignedTombstone: v.GenericSchema<unknown, t.UnsignedTombstone> =
	v.looseObject(unsignedTombstoneEntries);

export const tombstone: v.GenericSchema<unknown, t.Tombstone> = v.looseObject({
	...unsignedTombstoneEntries,
	sig: v.string(),
});
// #endregion

// #region Entry
export const compatibleOperation: v.GenericSchema<unknown, t.CompatibleOperation> = v.union([
	operation,
	legacyCreateOperation,
]);

export const compatibleOperationOrTombstone: v.GenericSchema<unknown, t.CompatibleOperationOrTombstone> =
	v.union([operation, legacyCreateOperation, tombstone]);

export const operationOrTombstone: v.GenericSchema<unknown, t.OperationOrTombstone> = v.union([
	operation,
	tombstone,
]);

export const operationLog: v.GenericSchema<unknown, t.OperationLog> = v.tupleWithRest(
	[compatibleOperation],
	operationOrTombstone,
);
// #endregion

// #region Indexed entry
const indexedEntryEntries = {
	did: didPlcString,
	operation: compatibleOperationOrTombstone,
	cid: cidString,
	nullified: v.boolean(),
	createdAt: v.pipe(
		v.string(),
		v.check((input) => !Number.isNaN(new Date(input).getTime()), `invalid timestamp`),
	),
};

export const indexedEntry: v.GenericSchema<unknown, t.IndexedEntry> = v.looseObject(indexedEntryEntries);

export const indexedEntryLog: v.GenericSchema<unknown, t.IndexedEntryLog> = v.tupleWithRest(
	[v.looseObject({ ...indexedEntryEntries, operation: compatibleOperation })],
	v.looseObject({ ...indexedEntryEntries, operation: operationOrTombstone }),
);
// #endregion

// #region Client response schemas
export const plcState: v.GenericSchema<unknown, t.PlcState> = v.looseObject({
	did: didPlcString,
	rotationKeys: v.array(didKeyString),
	verificationMethods: v.record(v.string(), permissiveDidKeyString),
	alsoKnownAs: v.array(v.string()),
	services: v.record(v.string(), service),
});

export const sequencedEntry: v.GenericSchema<unknown, t.SequencedEntry> = v.looseObject({
	...indexedEntryEntries,
	type: v.literal('sequenced_op'),
	seq: v.number(),
});
// #endregion
