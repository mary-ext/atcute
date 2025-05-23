import * as CarReader from '../car-reader/index.js';
import { assert } from '../utils.js';

import { isCommit } from './mst.js';
import { collectBlock, readBlock, walkMstEntries } from './sync-blockmap.js';
import { RepoEntry } from './types.js';

export function* fromUint8Array(buf: Uint8Array): Generator<RepoEntry> {
	const car = CarReader.fromUint8Array(buf);
	const roots = car.roots;

	assert(roots.length === 1, `expected only 1 root in the car archive; got=${roots.length}`);

	const blockmap = collectBlock(car);
	assert(blockmap.size > 0, `expected at least 1 block in the archive; got=${blockmap.size}`);

	const commit = readBlock(blockmap, roots[0], isCommit);

	for (const { key, cid } of walkMstEntries(blockmap, commit.data)) {
		const [collection, rkey] = key.split('/');

		const carEntry = blockmap.get(cid.$link);
		assert(carEntry != null, `cid not found in blockmap; cid=${cid}`);

		yield new RepoEntry(collection, rkey, cid, carEntry);
	}
}
