import Queue from 'yocto-queue';

import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { decodeUtf8From } from '@atcute/uint8array';

import * as CarReader from '../car-reader/index.js';
import { assert } from '../utils.js';

import { isCommit, isMstNode } from './mst.js';
import { RepoEntry } from './types.js';

type EntryMeta = { t: 0 } | { t: 1 } | { t: 2; k: string };

type Task = {
	c: string;
	e: CarReader.CarEntry;
	m: EntryMeta;
};

export type MissingBlockEntry =
	| {
			cid: string;
			type: 'record';
			key: string;
	  }
	| {
			cid: string;
			type: 'mst-node';
	  }
	| {
			cid: string;
			type: 'commit';
	  };

export interface StreamedRepoReader {
	/**
	 * list of blocks that were referenced but not found in the repository.
	 * blocks may be reported as missing if multiple records share the same CID.
	 */
	readonly missingBlocks: readonly MissingBlockEntry[];

	dispose(): Promise<void>;

	[Symbol.asyncDispose](): Promise<void>;
	[Symbol.asyncIterator](): AsyncIterator<RepoEntry>;
}

export const fromStream = (stream: ReadableStream<Uint8Array>): StreamedRepoReader => {
	let missingBlocks: MissingBlockEntry[] = [];

	return {
		get missingBlocks() {
			return missingBlocks;
		},

		async dispose() {
			// does nothing for now
		},

		[Symbol.asyncDispose]() {
			return this.dispose();
		},
		async *[Symbol.asyncIterator]() {
			await using car = CarReader.fromStream(stream);

			const pending = new Map<string, EntryMeta>();
			const strays = new Map<string, CarReader.CarEntry>();

			const queue = new Queue<Task>();

			const request = (cid: string, meta: EntryMeta): void => {
				const entry = strays.get(cid);

				if (entry !== undefined) {
					strays.delete(cid);
					queue.enqueue({ c: cid, e: entry, m: meta });
				} else {
					pending.set(cid, meta);
				}
			};

			{
				const roots = await car.roots();
				assert(roots.length === 1, `expected only 1 root in the car archive; got=${roots.length}`);

				const rootCid = roots[0].$link;
				request(rootCid, { t: 0 });
			}

			for await (const entry of car) {
				const cid = CID.toString(entry.cid);

				{
					const meta = pending.get(cid);

					if (meta !== undefined) {
						pending.delete(cid);
						queue.enqueue({ c: cid, e: entry, m: meta });
					} else {
						strays.set(cid, entry);
					}
				}

				let task: Task | undefined;
				while ((task = queue.dequeue())) {
					const { c: cid, e: entry, m: meta } = task;

					switch (meta.t) {
						case 0: {
							const commit = CBOR.decode(entry.bytes);
							assert(isCommit(commit), `expected commit block; cid=${cid}`);

							request(commit.data.$link, { t: 1 });
							break;
						}
						case 1: {
							const node = CBOR.decode(entry.bytes);
							assert(isMstNode(node), `expected mst node block; cid=${cid}`);

							const entries = node.e;
							const left = node.l;

							let lastKey = '';

							if (left !== null) {
								request(left.$link, meta);
							}

							for (let i = 0, il = entries.length; i < il; i++) {
								const entry = entries[i];
								const next = entry.t;

								const key_str = decodeUtf8From(CBOR.fromBytes(entry.k));
								const key = lastKey.slice(0, entry.p) + key_str;

								lastKey = key;

								request(entry.v.$link, { t: 2, k: key });

								if (next !== null) {
									request(next.$link, { t: 1 });
								}
							}

							break;
						}
						case 2: {
							const [collection, rkey] = meta.k.split('/');

							yield new RepoEntry(collection, rkey, CID.toCidLink(entry.cid), entry);
							break;
						}
					}
				}
			}

			missingBlocks = Array.from(pending, ([cid, meta]): MissingBlockEntry => {
				switch (meta.t) {
					case 0: {
						return { cid, type: 'commit' };
					}
					case 1: {
						return { cid, type: 'mst-node' };
					}
					case 2: {
						return { cid, type: 'record', key: meta.k };
					}
				}
			});
		},
	};
};
