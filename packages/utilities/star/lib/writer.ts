import * as CBOR from '@atcute/cbor';
import { allocUnsafe } from '@atcute/uint8array';
import * as varint from '@atcute/varint';

import { MAX_KEY_LENGTH, MAX_META_LENGTH, MAX_VALUE_LENGTH, STAR_MAGIC } from './constants.ts';
import { type StarMeta, type StarPair, isStarMeta } from './types.ts';

/**
 * serializes a STAR v1 header
 *
 * @param meta archive metadata
 * @returns header bytes including the magic prefix
 * @throws if the metadata lacks a `$type` string or its encoding exceeds 64 MiB
 * @internal
 */
export const serializeStarHeader = (meta: StarMeta): Uint8Array<ArrayBuffer> => {
	if (!isStarMeta(meta)) {
		throw new TypeError(`star metadata must be a map with a $type string`);
	}

	const data = CBOR.encode(meta);
	if (data.length > MAX_META_LENGTH) {
		throw new RangeError(`star metadata exceeds limit; length=${data.length} limit=${MAX_META_LENGTH}`);
	}

	const magicSize = STAR_MAGIC.length;
	const prefixSize = varint.encodingLength(data.length);
	const result = allocUnsafe(magicSize + prefixSize + data.length);

	result.set(STAR_MAGIC, 0);
	varint.encode(data.length, result, magicSize);
	result.set(data, magicSize + prefixSize);

	return result;
};

/**
 * serializes a STAR key-value pair
 *
 * @param key the key bytes
 * @param value the value bytes
 * @returns the serialized entry bytes
 * @throws if the key exceeds 64 MiB or the value exceeds 64 GiB
 * @internal
 */
export const serializeStarEntry = (key: Uint8Array, value: Uint8Array): Uint8Array<ArrayBuffer> => {
	if (key.length > MAX_KEY_LENGTH) {
		throw new RangeError(`star key exceeds limit; length=${key.length} limit=${MAX_KEY_LENGTH}`);
	}
	if (value.length > MAX_VALUE_LENGTH) {
		throw new RangeError(`star value exceeds limit; length=${value.length} limit=${MAX_VALUE_LENGTH}`);
	}

	const keyPrefixSize = varint.encodingLength(key.length);
	const valuePrefixSize = varint.encodingLength(value.length);
	const result = allocUnsafe(keyPrefixSize + key.length + valuePrefixSize + value.length);

	let pos = 0;

	pos += varint.encode(key.length, result, pos);
	result.set(key, pos);
	pos += key.length;

	pos += varint.encode(value.length, result, pos);
	result.set(value, pos);

	return result;
};

/**
 * writes a STAR archive
 *
 * @param meta archive metadata
 * @param pairs iterable of key-value pairs to write
 * @returns an async generator yielding the header, then one chunk per pair
 * @throws if metadata is invalid or metadata, keys, or values exceed STAR's limits
 */
export async function* writeStarStream(
	meta: StarMeta,
	pairs: AsyncIterable<StarPair> | Iterable<StarPair>,
): AsyncGenerator<Uint8Array<ArrayBuffer>> {
	yield serializeStarHeader(meta);

	for await (const pair of pairs) {
		yield serializeStarEntry(pair.key, pair.value);
	}
}
