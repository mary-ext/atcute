import type { BlockMap } from '../blockmap.ts';

type BlockEntry = [cid: string, bytes: Uint8Array<ArrayBuffer>];

/**
 * copies multiple blocks from an iterable into the map
 *
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
 *
 * @param map the block map to remove from
 * @param cids the CID strings to remove
 */
export const deleteMany = (map: BlockMap, cids: Iterable<string>) => {
	for (const cid of cids) {
		map.delete(cid);
	}
};
