import type * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import type * as ComAtprotoRepoApplyWrites from '@atcute/atproto/types/repo/applyWrites';
import type * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/atproto/types/repo/uploadBlob'; // oxlint-disable-line unicorn/require-module-specifiers -- ambient type augmentation
import type * as AppBskyEmbedExternal from '@atcute/bluesky/types/app/embed/external';
import type * as AppBskyEmbedImages from '@atcute/bluesky/types/app/embed/images';
import type * as AppBskyEmbedRecord from '@atcute/bluesky/types/app/embed/record';
import type * as AppBskyEmbedVideo from '@atcute/bluesky/types/app/embed/video';
import type * as AppBskyFeedDefs from '@atcute/bluesky/types/app/feed/defs';
import type {} from '@atcute/bluesky/types/app/feed/getFeedGenerator'; // oxlint-disable-line unicorn/require-module-specifiers -- ambient type augmentation
import type {} from '@atcute/bluesky/types/app/feed/getPosts'; // oxlint-disable-line unicorn/require-module-specifiers -- ambient type augmentation
import type * as AppBskyFeedPost from '@atcute/bluesky/types/app/feed/post';
import type * as AppBskyFeedThreadgate from '@atcute/bluesky/types/app/feed/threadgate';
import type {} from '@atcute/bluesky/types/app/graph/getList'; // oxlint-disable-line unicorn/require-module-specifiers -- ambient type augmentation
import type {} from '@atcute/bluesky/types/app/graph/getStarterPack'; // oxlint-disable-line unicorn/require-module-specifiers -- ambient type augmentation
import { type Client, ClientResponseError, ok } from '@atcute/client';
import type { $type, Blob as AtBlob, CanonicalResourceUri, ResourceUri } from '@atcute/lexicons';
import * as TID from '@atcute/tid';

import { serializeRecordCid } from './cbor.ts';
import { getNow } from './time.ts';
import type {
	ComposedThread,
	ComposedThreadgate,
	PostEmbed,
	PostMediaEmbed,
	PostRecordEmbed,
} from './types.ts';

export type * from './types.ts';

/**
 * Create post records and publish them
 *
 * @param client An authenticated Bluesky RPC client
 * @param thread Composed thread
 * @returns An array of post records that were published
 */
export async function publishThread(
	client: Client,
	thread: Omit<ComposedThread, 'client'>,
): Promise<$type.enforce<ComAtprotoRepoApplyWrites.Create>[]> {
	const records = await createThread({ ...thread, client: client });

	await ok(
		client.post('com.atproto.repo.applyWrites', {
			signal: thread.signal,
			input: {
				repo: thread.author,
				writes: records,
			},
		}),
	);

	return records;
}

/**
 * Create post records without publishing, allows you to do it yourself.
 *
 * @param thread Composed thread
 * @returns An array of post records
 */
export async function createThread(
	thread: ComposedThread,
): Promise<$type.enforce<ComAtprotoRepoApplyWrites.Create>[]> {
	const client = thread.client;
	const signal = thread.signal;

	const did = thread.author;
	const posts = thread.posts;
	const threadgate = thread.gate;
	const languages = thread.languages;

	const writes: $type.enforce<ComAtprotoRepoApplyWrites.Create>[] = [];

	const now = thread.createdAt !== undefined ? new Date(thread.createdAt) : new Date(getNow(posts.length));
	assert(!Number.isNaN(now.getTime()), `provided createdAt value is invalid`);

	let reply: AppBskyFeedPost.ReplyRef | undefined;
	let rkey: string | undefined;

	if (thread.reply) {
		let post = thread.reply;

		if (typeof post === 'string') {
			// AT-URI being passed
			assertClient(client, `ComposedThread.reply`);
			post = await getPost(post as ResourceUri);
		}

		let root: ComAtprotoRepoStrongRef.Main | undefined;
		let ref: ComAtprotoRepoStrongRef.Main;

		if ('record' in post) {
			// AppBskyFeedDefs.PostView being passed

			root = (post.record as AppBskyFeedPost.Main).reply?.root;
			ref = { uri: post.uri, cid: post.cid };
		} else if ('value' in post) {
			// AppBskyEmbedRecord.ViewRecord being passed

			root = (post.value as AppBskyFeedPost.Main).reply?.root;
			ref = { uri: post.uri, cid: post.cid };
		} else {
			assert(false, `Unexpected end of code`);
		}

		reply = {
			root: root ? { uri: root.uri, cid: root.cid } : ref,
			parent: ref,
		};
	}

	assert(!reply || !threadgate, `threadgate and reply are mutually exclusive`);

	for (let idx = 0, len = posts.length; idx < len; idx++) {
		// Get the record key for this post
		rkey = TID.createRaw(now.getTime(), Math.floor(Math.random() * 1024));

		const post = posts[idx];
		const uri: CanonicalResourceUri = `at://${did}/app.bsky.feed.post/${rkey}`;

		// Resolve embeds
		let embed: AppBskyFeedPost.Main['embed'];
		if (post.embed !== undefined) {
			embed = await resolveEmbed(post.embed);
		}

		// Get the self-labels
		const labels = getEmbedLabels(post.embed);
		let selfLabels: $type.enforce<ComAtprotoLabelDefs.SelfLabels> | undefined;

		if (labels?.length) {
			selfLabels = {
				$type: 'com.atproto.label.defs#selfLabels',
				values: labels.map((val) => ({ val })),
			};
		}

		// Now form the record
		const content = post.content;

		const record: AppBskyFeedPost.Main = {
			$type: 'app.bsky.feed.post',
			createdAt: now.toISOString(),
			text: content.text,
			facets: content.facets,
			reply: reply,
			embed: embed,
			langs: post.languages ?? languages,
			labels: selfLabels,
		};

		writes.push({
			$type: 'com.atproto.repo.applyWrites#create',
			collection: 'app.bsky.feed.post',
			rkey: rkey,
			value: record,
		});

		// If this is the first post, and we have a threadgate set, create one now.
		if (idx === 0 && threadgate) {
			const threadgateRecord: AppBskyFeedThreadgate.Main = {
				$type: 'app.bsky.feed.threadgate',
				createdAt: now.toISOString(),
				post: uri,
				allow: resolveThreadgate(threadgate),
			};

			writes.push({
				$type: 'com.atproto.repo.applyWrites#create',
				collection: 'app.bsky.feed.threadgate',
				rkey: rkey,
				value: threadgateRecord,
			});
		}

		if (idx !== len - 1) {
			// Retrieve the next reply reference
			const serialized = await serializeRecordCid(record);

			const ref: ComAtprotoRepoStrongRef.Main = {
				cid: serialized,
				uri: uri,
			};

			reply = {
				root: reply ? reply.root : ref,
				parent: ref,
			};

			// Posts are not guaranteed to be shown in the correct order if they are
			// all posted with the same timestamp.
			now.setMilliseconds(now.getMilliseconds() + 1);
		}
	}

	return writes;

	async function resolveEmbed(embed: PostEmbed): Promise<AppBskyFeedPost.Main['embed'] | undefined> {
		const { media, record } = embed;

		if (media && record) {
			return {
				$type: 'app.bsky.embed.recordWithMedia',
				media: await resolveMediaEmbed(media),
				record: await resolveRecordEmbed(record),
			};
		} else if (media) {
			return resolveMediaEmbed(media);
		} else if (record) {
			return resolveRecordEmbed(record);
		}

		return;

		async function resolveMediaEmbed(
			embed: PostMediaEmbed,
		): Promise<$type.enforce<AppBskyEmbedExternal.Main | AppBskyEmbedImages.Main | AppBskyEmbedVideo.Main>> {
			const type = embed.type;

			if (type === 'external') {
				const rawThumb = embed.thumbnail;
				// oxlint-disable-next-line typescript/no-explicit-any
				let thumb: AtBlob<any> | undefined;

				if (rawThumb !== undefined) {
					if (rawThumb instanceof Blob) {
						assertClient(client, `PostExternalEmbed.thumbnail`);
						thumb = await uploadBlob(rawThumb);
					} else {
						thumb = rawThumb;
					}
				}

				return {
					$type: 'app.bsky.embed.external',
					external: {
						uri: embed.uri,
						title: embed.title,
						description: embed.description ?? '',
						thumb: thumb,
					},
				};
			}

			if (type === 'image') {
				const images: AppBskyEmbedImages.Image[] = [];

				for (const image of embed.images) {
					const aspectRatio = image.aspectRatio;
					const rawBlob = image.blob;
					// oxlint-disable-next-line typescript/no-explicit-any
					let blob: AtBlob<any>;

					if (rawBlob instanceof Blob) {
						assertClient(client, `PostImageEmbed.images[].blob`);
						blob = await uploadBlob(rawBlob);
					} else {
						blob = rawBlob;
					}

					images.push({
						image: blob,
						alt: image.alt ?? '',
						aspectRatio: aspectRatio ? { width: aspectRatio.width, height: aspectRatio.height } : undefined,
					});
				}

				return {
					$type: 'app.bsky.embed.images',
					images: images,
				};
			}

			if (type === 'video') {
				const aspectRatio = embed.aspectRatio;
				const rawBlob = embed.blob;
				// oxlint-disable-next-line typescript/no-explicit-any
				let blob: AtBlob<any> | undefined;

				if (rawBlob instanceof Blob) {
					assertClient(client, `PostVideoEmbed.blob`);
					blob = await uploadBlob(rawBlob);
				} else {
					blob = rawBlob;
				}

				return {
					$type: 'app.bsky.embed.video',
					video: blob,
					alt: embed.alt ?? '',
					aspectRatio: aspectRatio ? { width: aspectRatio.width, height: aspectRatio.height } : undefined,
				};
			}

			assert(false, `Unexpected end of code`);
		}

		async function resolveRecordEmbed(
			embed: PostRecordEmbed,
		): Promise<$type.enforce<AppBskyEmbedRecord.Main>> {
			const uri = embed.uri;
			let cid = embed.cid;

			if (cid === undefined) {
				const type = embed.type;

				if (type === 'quote') {
					assertClient(client, 'PostQuoteEmbed');

					const post = await getPost(uri);

					cid = post.cid;
				} else if (type === 'feed') {
					assertClient(client, 'PostFeedEmbed');

					const data = await ok(
						client.get('app.bsky.feed.getFeedGenerator', {
							signal: signal,
							params: { feed: uri },
						}),
					);

					cid = data.view.cid;
				} else if (type === 'list') {
					assertClient(client, 'PostListEmbed');

					const data = await ok(
						client.get('app.bsky.graph.getList', {
							signal: signal,
							params: { list: uri, limit: 1 },
						}),
					);

					cid = data.list.cid;
				} else if (type === 'starterpack') {
					assertClient(client, 'PostStarterpackEmbed');

					const data = await ok(
						client.get('app.bsky.graph.getStarterPack', {
							signal: signal,
							params: { starterPack: uri },
						}),
					);

					cid = data.starterPack.cid;
				} else {
					assert(false, `Unexpected end of code`);
				}
			}

			return {
				$type: 'app.bsky.embed.record',
				record: {
					uri: uri,
					cid: cid,
				},
			};
		}
	}

	async function uploadBlob(blob: Blob): Promise<AtBlob> {
		// `rpc` intentionally non-null asserted.
		const data = await ok(
			client!.post('com.atproto.repo.uploadBlob', {
				signal: signal,
				input: blob,
			}),
		);

		return data.blob;
	}

	async function getPost(uri: ResourceUri): Promise<AppBskyFeedDefs.PostView> {
		// `rpc` intentionally non-null asserted.
		const data = await ok(
			client!.get('app.bsky.feed.getPosts', {
				signal: signal,
				params: {
					uris: [uri],
				},
			}),
		);

		const post = data.posts[0];
		if (!post) {
			throw new ClientResponseError({
				status: 400,
				data: { error: 'NotFound', message: `Post not found: ${uri}` },
			});
		}

		return post;
	}
}

function resolveThreadgate(gate: ComposedThreadgate): AppBskyFeedThreadgate.Main['allow'] {
	const rules: AppBskyFeedThreadgate.Main['allow'] = [];

	if (gate.follows) {
		rules.push({ $type: 'app.bsky.feed.threadgate#followingRule' });
	}
	if (gate.mentions) {
		rules.push({ $type: 'app.bsky.feed.threadgate#mentionRule' });
	}

	for (const listUri of gate.listUris ?? []) {
		rules.push({ $type: 'app.bsky.feed.threadgate#listRule', list: listUri });
	}

	return rules;
}

function getEmbedLabels(embed: PostEmbed | undefined): string[] | undefined {
	const media = embed?.media;

	if (media !== undefined) {
		const type = media.type;

		if (type === 'image' || type === 'external') {
			return media.labels;
		}
	}
}

function assert(condition: boolean, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

function assertClient(client: Client | undefined, thing: string): asserts client {
	if (client === undefined) {
		throw new Error(`${thing} requires supplying Client instance`);
	}
}
