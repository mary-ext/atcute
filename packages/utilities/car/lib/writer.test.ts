import * as CID from '@atcute/cid';
import { concat, encodeUtf8 } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import type { CarBlock } from './types.ts';
import { serializeCarEntry, serializeCarHeader, writeCarStream } from './writer.ts';

const multiBlockGenerator = async function* (): AsyncGenerator<CarBlock> {
	for (let i = 0; i < 5; i++) {
		const blockCid = await CID.create(0x55, encodeUtf8(`block${i}`));
		const blockData = encodeUtf8(`data${i}`);
		yield { cid: blockCid.bytes, data: blockData };
	}
};

describe('serializeCarHeader', () => {
	it('should serialize a header with one root', async () => {
		const cid = CID.toCidLink(await CID.create(0x55, encodeUtf8('test')));
		const header = serializeCarHeader([cid]);

		expect(header.length).toBeGreaterThan(0);
		// Should start with a varint length
		expect(header[0]).toBeGreaterThan(0);
	});

	it('should serialize a header with multiple roots', async () => {
		const cid1 = CID.toCidLink(await CID.create(0x55, encodeUtf8('test1')));
		const cid2 = CID.toCidLink(await CID.create(0x55, encodeUtf8('test2')));
		const header = serializeCarHeader([cid1, cid2]);

		expect(header.length).toBeGreaterThan(0);
	});

	it('should serialize a header with no roots', () => {
		const header = serializeCarHeader([]);
		expect(header.length).toBeGreaterThan(0);
	});
});

describe('serializeCarEntry', () => {
	it('should serialize a CAR entry', async () => {
		const cid = await CID.create(0x55, encodeUtf8('test'));
		const data = encodeUtf8('hello world');

		const entry = serializeCarEntry(cid.bytes, data);

		expect(entry.length).toBe(1 + cid.bytes.length + data.length); // varint(1 byte) + cid + data
		// Check that the entry starts with the correct length varint
		expect(entry[0]).toBe(cid.bytes.length + data.length);
	});
});

describe('writeCarStream', () => {
	it('should stream a CAR with a single block', async () => {
		const rootCid = CID.toCidLink(await CID.create(0x55, encodeUtf8('root')));
		const blockCid = await CID.create(0x55, encodeUtf8('block1'));
		const blockData = encodeUtf8('data1');

		const blocks = async function* (): AsyncGenerator<CarBlock> {
			yield { cid: blockCid.bytes, data: blockData };
		};

		const chunks: Uint8Array[] = [];
		for await (const chunk of writeCarStream([rootCid], blocks())) {
			chunks.push(chunk);
		}

		expect(chunks.length).toBe(2); // header + 1 block

		const carBytes = concat(chunks);
		expect(carBytes.length).toBeGreaterThan(0);
		expect(carBytes[0]).toBeGreaterThan(0); // header starts with varint
	});

	it('should stream a CAR with multiple blocks', async () => {
		const rootCid = CID.toCidLink(await CID.create(0x55, encodeUtf8('root')));

		const chunks = await Array.fromAsync(writeCarStream([rootCid], multiBlockGenerator()));
		const car = concat(chunks);

		expect(chunks).toHaveLength(6); // header + 5 blocks
		expect(car.length).toBeGreaterThan(0);
	});

	it('should produce consistent output', async () => {
		const rootCid = CID.toCidLink(await CID.create(0x55, encodeUtf8('root')));
		const blockCid = await CID.create(0x55, encodeUtf8('block'));
		const blockData = encodeUtf8('data');

		const blocks: CarBlock[] = [{ cid: blockCid.bytes, data: blockData }];

		const chunks1: Uint8Array[] = [];
		for await (const chunk of writeCarStream([rootCid], blocks)) {
			chunks1.push(chunk);
		}

		const chunks2: Uint8Array[] = [];
		for await (const chunk of writeCarStream([rootCid], blocks)) {
			chunks2.push(chunk);
		}

		const bytes1 = concat(chunks1);
		const bytes2 = concat(chunks2);

		expect(bytes1).toEqual(bytes2);
	});
});
