import type { ComAtprotoLabelDefs } from '@atcute/atproto';
import { Secp256k1PrivateKey } from '@atcute/crypto';
import type { Did } from '@atcute/lexicons';
import { XRPCRouter } from '@atcute/xrpc-server';

import { describe, expect, it } from 'vitest';

import { Labeler, type LabelerOptions } from './labeler.ts';
import { formatLabel } from './labels.ts';
import type { LabelStore, SavedLabel } from './store.ts';

const TEST_DID = 'did:plc:testlabeler' as Did;

const getTestKey = async () => {
	const keyBytes = new Uint8Array(32);
	keyBytes[0] = 1;
	return Secp256k1PrivateKey.importRaw(keyBytes);
};

const createMockStore = (): LabelStore & { labels: SavedLabel[] } => {
	const labels: SavedLabel[] = [];

	return {
		labels,
		async save(label) {
			const seq = labels.length + 1;
			const saved = { ...label, seq };
			labels.push(saved);
			return saved;
		},
		async query({ uriPatterns, sources, cursor, limit }) {
			let result = [...labels];

			// filter by URI patterns
			if (uriPatterns.length > 0 && !uriPatterns.includes('*')) {
				result = result.filter((l) =>
					uriPatterns.some((pattern) => {
						if (pattern.endsWith('*')) {
							return l.uri.startsWith(pattern.slice(0, -1));
						}
						return l.uri === pattern;
					}),
				);
			}

			// filter by sources
			if (sources.length > 0) {
				result = result.filter((l) => sources.includes(l.src));
			}

			// filter by cursor
			if (cursor > 0) {
				result = result.filter((l) => l.seq > cursor);
			}

			// apply limit
			result = result.slice(0, limit);

			const formatted: ComAtprotoLabelDefs.Label[] = result.map(formatLabel);
			const lastSeq = result.at(-1)?.seq ?? 0;

			return { labels: formatted, cursor: String(lastSeq) };
		},
		async getLatestSeq() {
			return labels.at(-1)?.seq ?? 0;
		},
		async getRange(after, limit) {
			const result = labels.filter((l) => l.seq > after);
			return limit !== undefined ? result.slice(0, limit) : result;
		},
	};
};

const createMockWebSocket = () => ({
	async upgrade() {
		return undefined;
	},
});

const createTestRouter = async (options?: Partial<LabelerOptions>) => {
	const key = await getTestKey();
	const store = createMockStore();

	const labeler = new Labeler({
		did: TEST_DID,
		key,
		store,
		...options,
	});

	const router = new XRPCRouter({ websocket: createMockWebSocket() });
	labeler.register(router);

	return { labeler, store, router };
};

describe('Labeler', () => {
	describe('createLabel', () => {
		it('should create and save a label', async () => {
			const { labeler, store } = await createTestRouter();

			const saved = await labeler.createLabel({
				uri: 'did:plc:target',
				val: 'spam',
			});

			expect(saved.seq).toBe(1);
			expect(saved.src).toBe(TEST_DID);
			expect(saved.uri).toBe('did:plc:target');
			expect(saved.val).toBe('spam');
			expect(saved.neg).toBe(false);
			expect(saved.sig.byteLength).toBe(64);
			expect(store.labels).toHaveLength(1);
		});

		it('should create labels with custom src', async () => {
			const { labeler } = await createTestRouter();

			const saved = await labeler.createLabel({
				uri: 'did:plc:target',
				val: 'spam',
				src: 'did:plc:custom',
			});

			expect(saved.src).toBe('did:plc:custom');
		});
	});

	describe('createLabels', () => {
		it('should create and negate labels for a subject', async () => {
			const { labeler, store } = await createTestRouter();

			const results = await labeler.createLabels(
				{ uri: 'did:plc:target' },
				{ create: ['spam', 'nsfw'], negate: ['misleading'] },
			);

			expect(results).toHaveLength(3);
			expect(results[0]!.val).toBe('spam');
			expect(results[0]!.neg).toBe(false);
			expect(results[1]!.val).toBe('nsfw');
			expect(results[1]!.neg).toBe(false);
			expect(results[2]!.val).toBe('misleading');
			expect(results[2]!.neg).toBe(true);
			expect(store.labels).toHaveLength(3);
		});
	});

	describe('queryLabels endpoint', () => {
		it('should return labels matching URI patterns', async () => {
			const { labeler, router } = await createTestRouter();

			await labeler.createLabel({ uri: 'did:plc:user1', val: 'spam' });
			await labeler.createLabel({ uri: 'did:plc:user2', val: 'nsfw' });

			const response = await router.fetch(
				new Request('http://localhost/xrpc/com.atproto.label.queryLabels?uriPatterns=*'),
			);

			expect(response.status).toBe(200);

			const body = await response.json();
			expect(body.labels).toHaveLength(2);
			expect(body.cursor).toBeDefined();
		});

		it('should paginate with cursor', async () => {
			const { labeler, router } = await createTestRouter();

			await labeler.createLabel({ uri: 'did:plc:user1', val: 'spam' });
			await labeler.createLabel({ uri: 'did:plc:user2', val: 'nsfw' });

			const response = await router.fetch(
				new Request('http://localhost/xrpc/com.atproto.label.queryLabels?uriPatterns=*&limit=1'),
			);

			const body = await response.json();
			expect(body.labels).toHaveLength(1);
			expect(body.labels[0].val).toBe('spam');

			// fetch next page
			const response2 = await router.fetch(
				new Request(
					`http://localhost/xrpc/com.atproto.label.queryLabels?uriPatterns=*&limit=1&cursor=${body.cursor}`,
				),
			);

			const body2 = await response2.json();
			expect(body2.labels).toHaveLength(1);
			expect(body2.labels[0].val).toBe('nsfw');
		});
	});

	describe('emitEvent endpoint', () => {
		it('should not register without auth', async () => {
			const { router } = await createTestRouter();

			const response = await router.fetch(
				new Request('http://localhost/xrpc/tools.ozone.moderation.emitEvent', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						event: {
							$type: 'tools.ozone.moderation.defs#modEventLabel',
							createLabelVals: ['spam'],
							negateLabelVals: [],
						},
						subject: {
							$type: 'com.atproto.admin.defs#repoRef',
							did: 'did:plc:target',
						},
						createdBy: TEST_DID,
					}),
				}),
			);

			expect(response.status).toBe(404);
		});

		it('should reject when auth returns false', async () => {
			const { router } = await createTestRouter({
				auth: () => false,
			});

			const response = await router.fetch(
				new Request('http://localhost/xrpc/tools.ozone.moderation.emitEvent', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						event: {
							$type: 'tools.ozone.moderation.defs#modEventLabel',
							createLabelVals: ['spam'],
							negateLabelVals: [],
						},
						subject: {
							$type: 'com.atproto.admin.defs#repoRef',
							did: 'did:plc:target',
						},
						createdBy: TEST_DID,
					}),
				}),
			);

			expect(response.status).toBe(401);
		});
	});

	describe('register', () => {
		it('should return 404 for unknown routes', async () => {
			const { router } = await createTestRouter();

			const response = await router.fetch(new Request('http://localhost/xrpc/com.atproto.nonexistent'));

			expect(response.status).toBe(404);
		});
	});
});
