import * as CBOR from '@atcute/cbor';
import type { CidLink } from '@atcute/cid';
import { allocUnsafe } from '@atcute/uint8array';
import * as varint from '@atcute/varint';

import type { CarBlock } from './types.js';

/**
 * encodes a number as an unsigned varint (variable-length integer)
 * @param n the number to encode
 * @returns the varint-encoded bytes
 */
const encodeVarint = (n: number): Uint8Array<ArrayBuffer> => {
	const length = varint.encodingLength(n);
	const buf = allocUnsafe(length);
	varint.encode(n, buf, 0);
	return buf;
};

/**
 * serializes a CAR v1 header
 * @internal
 * @param roots array of root CIDs (typically just one)
 * @returns the serialized header bytes
 */
export const serializeCarHeader = (roots: readonly CidLink[]): Uint8Array<ArrayBuffer> => {
	const headerData = CBOR.encode({
		version: 1,
		roots: roots,
	});

	const headerSize = encodeVarint(headerData.length);
	const result = allocUnsafe(headerSize.length + headerData.length);

	result.set(headerSize, 0);
	result.set(headerData, headerSize.length);

	return result;
};

/**
 * serializes a single CAR entry (block)
 * @internal
 * @param cid the CID of the block (as bytes)
 * @param data the block data
 * @returns the serialized entry bytes
 */
export const serializeCarEntry = (cid: Uint8Array, data: Uint8Array): Uint8Array<ArrayBuffer> => {
	const entrySize = encodeVarint(cid.length + data.length);
	const result = allocUnsafe(entrySize.length + cid.length + data.length);

	result.set(entrySize, 0);
	result.set(cid, entrySize.length);
	result.set(data, entrySize.length + cid.length);

	return result;
};

/**
 * creates an async generator that yields CAR file chunks
 * @param root root CIDs for the CAR file
 * @param blocks async iterable of blocks to write
 * @yields Uint8Array chunks of the CAR file (header, then entries)
 *
 * @example
 * ```typescript
 * const blocks = async function* () {
 *   yield { cid: commitCid.bytes, data: commitBytes };
 *   yield { cid: nodeCid.bytes, data: nodeBytes };
 * };
 *
 * // Stream chunks
 * for await (const chunk of writeCarStream([rootCid], blocks())) {
 *   stream.write(chunk);
 * }
 *
 * // Or collect into array (requires Array.fromAsync or polyfill)
 * const chunks = await Array.fromAsync(writeCarStream([rootCid], blocks()));
 * ```
 */
export async function* writeCarStream(
	roots: CidLink[],
	blocks: AsyncIterable<CarBlock> | Iterable<CarBlock>,
): AsyncGenerator<Uint8Array<ArrayBuffer>> {
	// Emit header first
	yield serializeCarHeader(roots);

	// Then emit each block entry
	for await (const block of blocks) {
		yield serializeCarEntry(block.cid, block.data);
	}
}
