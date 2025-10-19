import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';

type BlockEntry = [cid: string, bytes: Uint8Array<ArrayBuffer>];

/** a map from CID strings to their encoded block data */
export type BlockMap = Map<string, Uint8Array<ArrayBuffer>>;

/**
 * encodes data as CBOR, computes its CID, and adds it to the map
 * @param map the block map to add to
 * @param data the data to encode and add
 */
export const add = async (map: BlockMap, data: unknown): Promise<void> => {
	const encoded = CBOR.encode(data);
	const cid = await CID.create(0x71, encoded);

	map.set(CID.toString(cid), encoded);
};

/**
 * copies multiple blocks from an iterable into the map
 * @param map the block map to add to
 * @param entries the block entries to add
 */
export const setMany = (map: BlockMap, entries: Iterable<Readonly<BlockEntry>>) => {
	for (const [cid, bytes] of entries) {
		map.set(cid, bytes);
	}
};

/**
 * removes multiple blocks from the map by their CIDs
 * @param map the block map to remove from
 * @param cids the CID strings to remove
 */
export const deleteMany = (map: BlockMap, cids: Iterable<string>) => {
	for (const cid of cids) {
		map.delete(cid);
	}
};
