import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';

type BlockEntry = [cid: string, bytes: Uint8Array<ArrayBuffer>];

export type BlockMap = Map<string, Uint8Array<ArrayBuffer>>;

export const add = async (map: BlockMap, data: unknown): Promise<void> => {
	const encoded = CBOR.encode(data);
	const cid = await CID.create(0x71, encoded);

	map.set(CID.toString(cid), encoded);
};

export const setMany = (map: BlockMap, entries: Iterable<Readonly<BlockEntry>>) => {
	for (const [cid, bytes] of entries) {
		map.set(cid, bytes);
	}
};

export const deleteMany = (map: BlockMap, cids: Iterable<string>) => {
	for (const cid of cids) {
		map.delete(cid);
	}
};
