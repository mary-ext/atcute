import * as v from '@badrap/valita';

import * as CID from '@atcute/cid';
import { parseDidKey } from '@atcute/crypto';
import { isKeyDid, isPlcDid } from '@atcute/identity';

import * as t from './types.js';

// #region Strings
export const didPlcString = v.string().assert(isPlcDid, `must be a did:plc`);

export const permissiveDidKeyString = v.string().assert(isKeyDid, `must be a did:key`);

export const didKeyString = v.string().chain((input) => {
	try {
		parseDidKey(input);
	} catch (err) {
		if (err instanceof SyntaxError) {
			return v.err(`did:key can't be parsed`);
		}

		return v.err(`invalid did:key`);
	}

	return v.ok(input as t.DidKeyString);
});

const cidString = v.string().chain((input) => {
	try {
		CID.fromString(input);
	} catch {
		return v.err(`invalid cid`);
	}

	return v.ok(input);
});
// #endregion

// #region create
const _unsignedLegacyCreateOperation = v.object({
	type: v.literal('create'),
	prev: v.null(),
	signingKey: didKeyString,
	recoveryKey: didKeyString,
	handle: v.string(),
	service: v.string(),
}) satisfies v.Type<t.UnsignedLegacyCreateOperation>;

export const unsignedLegacyCreateOperation: v.Type<t.UnsignedLegacyCreateOperation> =
	_unsignedLegacyCreateOperation;

export const legacyCreateOperation: v.Type<t.LegacyCreateOperation> = _unsignedLegacyCreateOperation.extend({
	sig: v.string(),
});
// #endregion

// #region plc_operation
export const service: v.Type<t.Service> = v.object({
	type: v.string(),
	endpoint: v.string(),
});

const _unsignedOperation = v.object({
	type: v.literal('plc_operation'),
	prev: v.string().nullable(),
	rotationKeys: v.array(didKeyString),
	verificationMethods: v.record(permissiveDidKeyString),
	alsoKnownAs: v.array(v.string()),
	services: v.record(service),
}) satisfies v.Type<t.UnsignedOperation>;

export const unsignedOperation: v.Type<t.UnsignedOperation> = _unsignedOperation;

export const operation: v.Type<t.Operation> = _unsignedOperation.extend({
	sig: v.string(),
});
// #endregion

// #region plc_tombstone
const _unsignedTombstone = v.object({
	type: v.literal('plc_tombstone'),
	prev: v.string(),
}) satisfies v.Type<t.UnsignedTombstone>;

export const unsignedTombstone: v.Type<t.UnsignedTombstone> = _unsignedTombstone;

export const tombstone: v.Type<t.Tombstone> = _unsignedTombstone.extend({
	sig: v.string(),
});
// #endregion

// #region Entry
export const compatibleOperation: v.Type<t.CompatibleOperation> = v.union(operation, legacyCreateOperation);

export const compatibleOperationOrTombstone: v.Type<t.CompatibleOperationOrTombstone> = v.union(
	operation,
	legacyCreateOperation,
	tombstone,
);

export const operationOrTombstone: v.Type<t.OperationOrTombstone> = v.union(operation, tombstone);

export const operationLog: v.Type<t.OperationLog> = v
	.tuple([compatibleOperation])
	.concat(v.array(operationOrTombstone));
// #endregion

// #region Indexed entry
const _indexedEntry = v.object({
	did: didPlcString,
	operation: compatibleOperationOrTombstone,
	cid: cidString,
	nullified: v.boolean(),
	createdAt: v.string().assert((input) => !Number.isNaN(new Date(input).getTime()), `invalid timestamp`),
}) satisfies v.Type<t.IndexedEntry>;

export const indexedEntry: v.Type<t.IndexedEntry> = _indexedEntry;

export const indexedEntryLog: v.Type<t.IndexedEntryLog> = v
	.tuple([_indexedEntry.extend({ operation: compatibleOperation })])
	.concat(v.array(_indexedEntry.extend({ operation: operationOrTombstone })));
// #endregion
