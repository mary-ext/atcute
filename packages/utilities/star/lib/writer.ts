import * as CBOR from '@atcute/cbor';
import { allocUnsafe } from '@atcute/uint8array';
import * as varint from '@atcute/varint';

import { END_MARKER, PAIR_MARKER, STAR_MAGIC } from './constants.ts';
import { type StarMeta, type StarPair, isStarMeta } from './types.ts';

/**
 * serializes a STAR header
 *
 * @param meta archive metadata
 * @returns header bytes including the magic prefix
 * @throws if the metadata lacks a `$type` string
 * @internal
 */
export const serializeStarHeader = (meta: StarMeta): Uint8Array<ArrayBuffer> => {
	if (!isStarMeta(meta)) {
		throw new TypeError(`star metadata must be a map with a $type string`);
	}

	const data = CBOR.encode(meta);
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
 * @returns the serialized entry bytes including the leading pair marker
 * @internal
 */
export const serializeStarEntry = (key: Uint8Array, value: Uint8Array): Uint8Array<ArrayBuffer> => {
	const keyPrefixSize = varint.encodingLength(key.length);
	const valuePrefixSize = varint.encodingLength(value.length);
	const result = allocUnsafe(1 + keyPrefixSize + key.length + valuePrefixSize + value.length);

	let pos = 0;

	result[pos++] = PAIR_MARKER;

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
 * @returns an async generator yielding the header, one chunk per pair, and the terminal byte
 * @throws if metadata is invalid
 */
export async function* writeStarStream(
	meta: StarMeta,
	pairs: AsyncIterable<StarPair> | Iterable<StarPair>,
): AsyncGenerator<Uint8Array<ArrayBuffer>> {
	yield serializeStarHeader(meta);

	for await (const pair of pairs) {
		yield serializeStarEntry(pair.key, pair.value);
	}

	yield Uint8Array.of(END_MARKER);
}
