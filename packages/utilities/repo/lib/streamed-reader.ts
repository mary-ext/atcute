import type { CarEntry } from '@atcute/car';
import * as CAR from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import type { CidLink } from '@atcute/cid';
import * as CID from '@atcute/cid';
import { isNodeData } from '@atcute/mst';

import { RepoEntry, type RepoReaderOptions, isCommit } from './types.ts';
import { assert } from './utils.ts';
import { CidMap } from './utils/cid-map.ts';
import { MAX_NODE_ENTRIES, decodeMstKey, parseMstKey } from './utils/mst.ts';
import Queue from './utils/queue.ts';

type EntryMeta = { t: 0 } | { t: 1 } | { t: 2; k: string };

type Task = {
	e: CarEntry;
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
	/** list of blocks that were referenced but not found in the repository */
	readonly missingBlocks: readonly MissingBlockEntry[];

	dispose(): Promise<void>;

	[Symbol.asyncDispose](): Promise<void>;
	[Symbol.asyncIterator](): AsyncIterator<RepoEntry>;
}

/**
 * creates a transform stream from repository CAR bytes to records
 *
 * @param options reader options
 * @returns a stream pair; read and verification errors propagate to the readable stream
 */
export const repoEntryTransform = (
	options?: RepoReaderOptions,
): ReadableWritablePair<RepoEntry, Uint8Array> => {
	const transform = new TransformStream<Uint8Array, Uint8Array>();
	let repo: StreamedRepoReader | undefined;

	return {
		readable: new ReadableStream({
			async start(controller) {
				repo = fromStream(transform.readable, options);

				try {
					for await (const entry of repo) {
						controller.enqueue(entry);
					}

					await repo.dispose();

					controller.close();
				} catch (err) {
					controller.error(err);
				}
			},
			async cancel() {
				if (repo !== undefined) {
					await repo.dispose();
				}
			},
		}),
		writable: transform.writable,
	};
};

/**
 * reads the records of a repository CAR from a stream
 *
 * @param stream the CAR archive byte stream
 * @param options reader options
 * @returns an async iterable of records reachable from the root commit
 * @throws during iteration if the archive or repository structure is malformed, or
 *   {@link CAR.CarBlockMismatchError} if a block's bytes do not match its CID
 */
export const fromStream = (
	stream: ReadableStream<Uint8Array>,
	options?: RepoReaderOptions,
): StreamedRepoReader => {
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
			// await using car = CarReader.fromStream(stream);
			const car = CAR.fromStream(stream, options);

			try {
				const pending = new CidMap<EntryMeta[]>();
				const strays = new CidMap<CarEntry>();

				const queue = new Queue<Task>();

				const request = (link: CidLink, meta: EntryMeta): void => {
					const cid = CID.toLinkBytes(link);
					const entry = strays.get(cid);

					if (entry !== undefined) {
						strays.delete(cid);
						queue.enqueue({ e: entry, m: meta });
					} else {
						const metas = pending.get(cid);

						if (metas !== undefined) {
							metas.push(meta);
						} else {
							pending.set(cid, [meta]);
						}
					}
				};

				{
					const roots = await car.roots();
					assert(roots.length >= 1, `expected at least 1 root in the car archive; got=${roots.length}`);

					request(roots[0], { t: 0 });
				}

				for await (const entry of car) {
					{
						const cid = entry.cid.bytes;
						const metas = pending.get(cid);

						if (metas !== undefined) {
							pending.delete(cid);

							for (let i = 0, il = metas.length; i < il; i++) {
								queue.enqueue({ e: entry, m: metas[i] });
							}
						} else {
							strays.set(cid, entry);
						}
					}

					let task: Task | undefined;
					while ((task = queue.dequeue())) {
						const { e: entry, m: meta } = task;

						switch (meta.t) {
							case 0: {
								const commit = CBOR.decode(entry.bytes);
								if (!isCommit(commit)) {
									throw new Error(`expected commit block; cid=${CID.toString(entry.cid)}`);
								}

								request(commit.data, { t: 1 });
								break;
							}
							case 1: {
								const node = CBOR.decode(entry.bytes);
								if (!isNodeData(node)) {
									throw new Error(`expected mst node block; cid=${CID.toString(entry.cid)}`);
								}

								const entries = node.e;
								const left = node.l;

								if (entries.length > MAX_NODE_ENTRIES) {
									throw new Error(`mst node has too many entries; count=${entries.length}`);
								}

								let lastKey = '';

								if (left !== null) {
									request(left, meta);
								}

								for (let i = 0, il = entries.length; i < il; i++) {
									const entry = entries[i];
									const next = entry.t;

									const key = decodeMstKey(lastKey, entry);
									lastKey = key;

									request(entry.v, { t: 2, k: key });

									if (next !== null) {
										request(next, { t: 1 });
									}
								}

								break;
							}
							case 2: {
								const { collection, rkey } = parseMstKey(meta.k);

								yield new RepoEntry(collection, rkey, CID.toCidLink(entry.cid), entry);
								break;
							}
						}
					}
				}

				{
					const missing: MissingBlockEntry[] = [];

					for (const [cid, metas] of pending.entries()) {
						for (let i = 0, il = metas.length; i < il; i++) {
							const meta = metas[i];

							switch (meta.t) {
								case 0: {
									missing.push({ cid, type: 'commit' });
									break;
								}
								case 1: {
									missing.push({ cid, type: 'mst-node' });
									break;
								}
								case 2: {
									missing.push({ cid, type: 'record', key: meta.k });
									break;
								}
							}
						}
					}

					missingBlocks = missing;
				}
			} finally {
				await car.dispose();
			}
		},
	};
};
