import { AppBskyActorDefs, AppBskyFeedDefs, AppBskyFeedGetFeed } from '@atcute/bluesky';
import * as v from '@atcute/lexicons/validations';

import { describe, expect, it, vi } from 'vitest';

import { NormalizedCache } from './store.js';

// sample data from https://api.bsky.app/xrpc/app.bsky.feed.getFeed
const sampleFeedResponse: AppBskyFeedGetFeed.$output = {
	cursor: 'eyJvIjoiMjAyNS0xMi0wNVQyMDozNDoyNy40NDA2OTEwNjlaIn0=',
	feed: [
		{
			post: {
				uri: 'at://did:plc:22oxxd7xnozzqadsljvq57vy/app.bsky.feed.post/3m7bwu54vqs2j',
				cid: 'bafyreiadxl3lsfumlcli6tzysmcyc7abpshygyodhgq7gwyplg75ozjrim',
				author: {
					did: 'did:plc:22oxxd7xnozzqadsljvq57vy',
					handle: 'thatmc.bsky.social',
					displayName: 'That Mack',
					avatar:
						'https://cdn.bsky.app/img/avatar/plain/did:plc:22oxxd7xnozzqadsljvq57vy/bafkreihelz336fougwoydtj4rtqgxo22w4uwkhw7cb5i7j24dfmxmfsysa@jpeg',
					labels: [],
					createdAt: '2023-11-14T18:03:54.458Z',
				},
				record: {
					$type: 'app.bsky.feed.post',
					createdAt: '2025-12-06T02:20:21.173Z',
					text: 'Heron and Cranes',
				},
				likeCount: 1780,
				repostCount: 89,
				replyCount: 43,
				quoteCount: 8,
				indexedAt: '2025-12-06T02:20:26.131Z',
				labels: [],
			},
			feedContext: 't-photography-blip2',
		},
		{
			post: {
				uri: 'at://did:plc:257qwyterkrxkrwxdn2qdotm/app.bsky.feed.post/3m7bomphtzk22',
				cid: 'bafyreiadzqccriq5wqzhjhtyjqk64bt22adc34lxxjivvmsgxqmuaf3j3i',
				author: {
					did: 'did:plc:257qwyterkrxkrwxdn2qdotm',
					handle: 'wpacheco-smamx.bsky.social',
					displayName: 'Wpacheco',
					avatar:
						'https://cdn.bsky.app/img/avatar/plain/did:plc:257qwyterkrxkrwxdn2qdotm/bafkreidij6bpsvg3atvec7o73l4n5642jf6k224jpq7h3dzjxekpvu3gly@jpeg',
					labels: [],
					createdAt: '2024-11-15T06:21:41.341Z',
				},
				record: {
					$type: 'app.bsky.feed.post',
					createdAt: '2025-12-05T23:53:02.039Z',
					text: 'FIFA is a joke.',
				},
				likeCount: 3279,
				repostCount: 436,
				replyCount: 156,
				quoteCount: 20,
				indexedAt: '2025-12-05T23:53:03.733Z',
				labels: [],
			},
			feedContext: 't-sports-blip2',
		},
	],
};

describe('NormalizedCache', () => {
	describe('define', () => {
		it('registers entity type', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			// should not throw when getting from a defined schema
			expect(cache.get(AppBskyFeedDefs.postViewSchema, 'at://test/post/1')).toBeUndefined();
		});

		it('throws on duplicate definition', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			expect(() => {
				cache.define({
					schema: AppBskyFeedDefs.postViewSchema,
					key: (post) => post.uri,
				});
			}).toThrow('entity type "app.bsky.feed.defs#postView" is already defined');
		});

		it('throws on schema without $type', () => {
			const cache = new NormalizedCache();
			const invalidSchema = v.object({ foo: v.string() });

			expect(() => {
				cache.define({
					schema: invalidSchema,
					key: (x: any) => x.foo,
				});
			}).toThrow('schema must have a $type literal field');
		});
	});

	describe('get/set/has', () => {
		it('stores and retrieves entities', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = sampleFeedResponse.feed[0].post;
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			expect(cache.has(AppBskyFeedDefs.postViewSchema, post.uri)).toBe(true);
			expect(cache.get(AppBskyFeedDefs.postViewSchema, post.uri)).toBe(post);
		});

		it('returns undefined for non-existent entities', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			expect(cache.get(AppBskyFeedDefs.postViewSchema, 'at://nonexistent')).toBeUndefined();
			expect(cache.has(AppBskyFeedDefs.postViewSchema, 'at://nonexistent')).toBe(false);
		});

		it('throws when setting to unregistered schema', () => {
			const cache = new NormalizedCache();
			const post = sampleFeedResponse.feed[0].post;

			expect(() => {
				cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);
			}).toThrow('schema is not registered');
		});
	});

	describe('update', () => {
		it('updates existing entity', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = { ...sampleFeedResponse.feed[0].post };
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			const result = cache.update(AppBskyFeedDefs.postViewSchema, post.uri, (existing) => ({
				...existing,
				likeCount: 9999,
			}));

			expect(result).toBe(true);
			expect(cache.get(AppBskyFeedDefs.postViewSchema, post.uri)?.likeCount).toBe(9999);
		});

		it('returns false when entity does not exist', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const result = cache.update(AppBskyFeedDefs.postViewSchema, 'at://nonexistent', (post) => post);
			expect(result).toBe(false);
		});
	});

	describe('delete', () => {
		it('removes entity from cache', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = sampleFeedResponse.feed[0].post;
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			expect(cache.delete(AppBskyFeedDefs.postViewSchema, post.uri)).toBe(true);
			expect(cache.has(AppBskyFeedDefs.postViewSchema, post.uri)).toBe(false);
		});

		it('returns false when entity does not exist', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			expect(cache.delete(AppBskyFeedDefs.postViewSchema, 'at://nonexistent')).toBe(false);
		});
	});

	describe('getAll', () => {
		it('returns all entities of a type', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post1 = sampleFeedResponse.feed[0].post;
			const post2 = sampleFeedResponse.feed[1].post;

			cache.set(AppBskyFeedDefs.postViewSchema, post1.uri, post1);
			cache.set(AppBskyFeedDefs.postViewSchema, post2.uri, post2);

			const all = cache.getAll(AppBskyFeedDefs.postViewSchema);
			expect(all.size).toBe(2);
			expect(all.get(post1.uri)).toBe(post1);
			expect(all.get(post2.uri)).toBe(post2);
		});
	});

	describe('clear', () => {
		it('removes all entities', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});
			cache.define({
				schema: AppBskyActorDefs.profileViewBasicSchema,
				key: (profile) => profile.did,
			});

			const post = sampleFeedResponse.feed[0].post;
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);
			cache.set(AppBskyActorDefs.profileViewBasicSchema, post.author.did, post.author);

			cache.clear();

			expect(cache.getAll(AppBskyFeedDefs.postViewSchema).size).toBe(0);
			expect(cache.getAll(AppBskyActorDefs.profileViewBasicSchema).size).toBe(0);
		});
	});

	describe('extract', () => {
		it('extracts and normalizes entities from response', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const outputSchema = AppBskyFeedGetFeed.mainSchema.output.schema;
			const response = structuredClone(sampleFeedResponse);
			const result = cache.normalize(outputSchema, response);

			// entities should be in the cache
			const post1 = cache.get(AppBskyFeedDefs.postViewSchema, sampleFeedResponse.feed[0].post.uri);
			const post2 = cache.get(AppBskyFeedDefs.postViewSchema, sampleFeedResponse.feed[1].post.uri);

			expect(post1).toBeDefined();
			expect(post2).toBeDefined();
			expect(post1?.likeCount).toBe(1780);
			expect(post2?.likeCount).toBe(3279);

			// result should have cached refs swapped in
			expect(result.feed[0].post).toBe(post1);
			expect(result.feed[1].post).toBe(post2);
		});

		it('merges entities with existing cache entries', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
				merge: (existing, incoming) => ({
					...incoming,
					likeCount: incoming.likeCount ?? existing.likeCount,
				}),
			});

			// first extract
			const outputSchema = AppBskyFeedGetFeed.mainSchema.output.schema;
			const response1 = structuredClone(sampleFeedResponse);
			cache.normalize(outputSchema, response1);

			const post = cache.get(AppBskyFeedDefs.postViewSchema, sampleFeedResponse.feed[0].post.uri);
			expect(post?.likeCount).toBe(1780);

			// second extract with updated data
			const response2 = structuredClone(sampleFeedResponse);
			response2.feed[0].post.likeCount = 2000;

			cache.normalize(outputSchema, response2);

			// should be same object reference
			expect(cache.get(AppBskyFeedDefs.postViewSchema, sampleFeedResponse.feed[0].post.uri)).toBe(post);
			// but with updated value
			expect(post?.likeCount).toBe(2000);
		});

		it('normalizes nested entities', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});
			cache.define({
				schema: AppBskyActorDefs.profileViewBasicSchema,
				key: (profile) => profile.did,
			});

			const outputSchema = AppBskyFeedGetFeed.mainSchema.output.schema;
			const response = structuredClone(sampleFeedResponse);
			const result = cache.normalize(outputSchema, response);

			// author should be normalized
			const author = cache.get(
				AppBskyActorDefs.profileViewBasicSchema,
				sampleFeedResponse.feed[0].post.author.did,
			);
			expect(author).toBeDefined();
			expect(author?.handle).toBe('thatmc.bsky.social');

			// and should be the same reference in the post
			const post = result.feed[0].post as any;
			expect(post.author).toBe(author);
		});

		it('shares same entity across multiple references', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyActorDefs.profileViewBasicSchema,
				key: (profile) => profile.did,
			});

			// create response where same author appears in multiple posts
			const author: AppBskyActorDefs.ProfileViewBasic = {
				did: 'did:plc:shared-author',
				handle: 'shared.bsky.social',
				displayName: 'Shared Author',
				labels: [],
			};

			const schema = v.object({
				feed: v.array(
					v.object({
						post: v.object({
							uri: v.string(),
							get author() {
								return AppBskyActorDefs.profileViewBasicSchema;
							},
						}),
					}),
				),
			});

			const response: v.InferOutput<typeof schema> = {
				feed: [
					{ post: { uri: 'at://test/post/1', author } },
					{ post: { uri: 'at://test/post/2', author: { ...author } } }, // clone
				],
			};

			const result = cache.normalize(schema, response);

			// both posts should reference the same cached author
			expect((result.feed[0].post as any).author).toBe((result.feed[1].post as any).author);
		});

		it('normalizer() returns a reusable function', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const outputSchema = AppBskyFeedGetFeed.mainSchema.output.schema;
			const normalizeResponse = cache.normalizer(outputSchema);

			const response1 = structuredClone(sampleFeedResponse);
			const result1 = normalizeResponse(response1);

			expect(cache.get(AppBskyFeedDefs.postViewSchema, sampleFeedResponse.feed[0].post.uri)).toBeDefined();
			expect(result1.feed[0].post).toBe(
				cache.get(AppBskyFeedDefs.postViewSchema, sampleFeedResponse.feed[0].post.uri),
			);

			// use the same normalizer again
			const response2 = structuredClone(sampleFeedResponse);
			response2.feed[0].post.likeCount = 5000;
			const result2 = normalizeResponse(response2);

			// should update the same cached entity
			expect(result2.feed[0].post).toBe(result1.feed[0].post);
			expect((result2.feed[0].post as any).likeCount).toBe(5000);
		});
	});

	describe('subscriptions', () => {
		it('notifies subscribers on set', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = sampleFeedResponse.feed[0].post;
			const callback = vi.fn();

			cache.subscribe(AppBskyFeedDefs.postViewSchema, post.uri, callback);
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			expect(callback).toHaveBeenCalledWith(post);
		});

		it('notifies subscribers on update', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = { ...sampleFeedResponse.feed[0].post };
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			const callback = vi.fn();
			cache.subscribe(AppBskyFeedDefs.postViewSchema, post.uri, callback);

			cache.update(AppBskyFeedDefs.postViewSchema, post.uri, (p) => ({ ...p, likeCount: 9999 }));

			expect(callback).toHaveBeenCalledWith(expect.objectContaining({ likeCount: 9999 }));
		});

		it('notifies subscribers on delete with undefined', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = sampleFeedResponse.feed[0].post;
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			const callback = vi.fn();
			cache.subscribe(AppBskyFeedDefs.postViewSchema, post.uri, callback);

			cache.delete(AppBskyFeedDefs.postViewSchema, post.uri);

			expect(callback).toHaveBeenCalledWith(undefined);
		});

		it('unsubscribes correctly', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = sampleFeedResponse.feed[0].post;
			const callback = vi.fn();

			const unsubscribe = cache.subscribe(AppBskyFeedDefs.postViewSchema, post.uri, callback);
			unsubscribe();

			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			expect(callback).not.toHaveBeenCalled();
		});

		it('notifies type subscribers on any entity change', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const callback = vi.fn();
			cache.subscribeType(AppBskyFeedDefs.postViewSchema, callback);

			const post1 = sampleFeedResponse.feed[0].post;
			const post2 = sampleFeedResponse.feed[1].post;

			cache.set(AppBskyFeedDefs.postViewSchema, post1.uri, post1);
			cache.set(AppBskyFeedDefs.postViewSchema, post2.uri, post2);

			expect(callback).toHaveBeenCalledTimes(2);
			expect(callback).toHaveBeenCalledWith(post1.uri, post1);
			expect(callback).toHaveBeenCalledWith(post2.uri, post2);
		});
	});

	describe('deleteType', () => {
		it('removes all entities of a type', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post1 = sampleFeedResponse.feed[0].post;
			const post2 = sampleFeedResponse.feed[1].post;

			cache.set(AppBskyFeedDefs.postViewSchema, post1.uri, post1);
			cache.set(AppBskyFeedDefs.postViewSchema, post2.uri, post2);

			cache.deleteType(AppBskyFeedDefs.postViewSchema);

			expect(cache.getAll(AppBskyFeedDefs.postViewSchema).size).toBe(0);
		});

		it('notifies subscribers when deleting type', () => {
			const cache = new NormalizedCache();
			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = sampleFeedResponse.feed[0].post;
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			const callback = vi.fn();
			cache.subscribe(AppBskyFeedDefs.postViewSchema, post.uri, callback);

			cache.deleteType(AppBskyFeedDefs.postViewSchema);

			expect(callback).toHaveBeenCalledWith(undefined);
		});
	});

	describe('wrapEntity option', () => {
		it('wraps new entities from extract', () => {
			const wrapEntity = vi.fn((entity: any) => {
				entity.__wrapped = true;
				return entity;
			});
			const cache = new NormalizedCache({ wrapEntity });

			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const outputSchema = AppBskyFeedGetFeed.mainSchema.output.schema;
			const response = structuredClone(sampleFeedResponse);
			cache.normalize(outputSchema, response);

			expect(wrapEntity).toHaveBeenCalled();

			const post = cache.get(AppBskyFeedDefs.postViewSchema, sampleFeedResponse.feed[0].post.uri);
			expect((post as any).__wrapped).toBe(true);
		});

		it('wraps new entities from set', () => {
			const wrapEntity = vi.fn((entity: any) => {
				entity.__wrapped = true;
				return entity;
			});
			const cache = new NormalizedCache({ wrapEntity });

			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = sampleFeedResponse.feed[0].post;
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			expect(wrapEntity).toHaveBeenCalledWith(post);

			const cached = cache.get(AppBskyFeedDefs.postViewSchema, post.uri);
			expect((cached as any).__wrapped).toBe(true);
		});

		it('does not re-wrap existing entities', () => {
			const wrapEntity = vi.fn((entity: any) => {
				entity.__wrapped = true;
				return entity;
			});
			const cache = new NormalizedCache({ wrapEntity });

			cache.define({
				schema: AppBskyFeedDefs.postViewSchema,
				key: (post) => post.uri,
			});

			const post = sampleFeedResponse.feed[0].post;
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, post);

			// update existing entity
			cache.set(AppBskyFeedDefs.postViewSchema, post.uri, { ...post, likeCount: 9999 });

			// wrapEntity should only be called once (for the initial set)
			expect(wrapEntity).toHaveBeenCalledTimes(1);
		});
	});
});
