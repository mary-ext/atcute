import '@atcute/bluesky/lexicons';

import { XRPCError, type XRPC } from '@atcute/client';
import type {
	AppBskyEmbedExternal,
	AppBskyEmbedImages,
	AppBskyEmbedRecord,
	AppBskyEmbedVideo,
	AppBskyFeedDefs,
	AppBskyFeedPost,
	AppBskyFeedThreadgate,
	At,
	Brand,
	ComAtprotoLabelDefs,
	ComAtprotoRepoApplyWrites,
	ComAtprotoRepoStrongRef,
} from '@atcute/client/lexicons';
import * as TID from '@atcute/tid';

import { serializeRecordCid } from './cbor.js';
import { getNow } from './time.js';

import type {
	ComposedThread,
	ComposedThreadgate,
	PostEmbed,
	PostMediaEmbed,
	PostRecordEmbed,
} from './types.js';

export type * from './types.js';

/**
 * Create post records and publish them
 * @param rpc An authenticated Bluesky RPC client
 * @param thread Composed thread
 * @returns An array of post records that were published
 */
export async function publishThread(
	rpc: XRPC,
	thread: Omit<ComposedThread, 'rpc'>,
): Promise<Brand.Union<ComAtprotoRepoApplyWrites.Create>[]> {
	const records = await createThread({ ...thread, rpc });

	await rpc.call('com.atproto.repo.applyWrites', {
		signal: thread.signal,
		data: {
			repo: thread.author,
			writes: records,
		},
	});

	return records;
}

/**
 * Create post records without publishing, allows you to do it yourself.
 * @param thread Composed thread
 * @returns An array of post records
 */
export async function createThread(
	thread: ComposedThread,
): Promise<Brand.Union<ComAtprotoRepoApplyWrites.Create>[]> {
	const rpc = thread.rpc;
	const signal = thread.signal;

	const did = thread.author;
	const posts = thread.posts;
	const threadgate = thread.gate;
	const languages = thread.languages;

	const writes: Brand.Union<ComAtprotoRepoApplyWrites.Create>[] = [];

	const now = thread.createdAt !== undefined ? new Date(thread.createdAt) : new Date(getNow(posts.length));
	assert(!Number.isNaN(now.getTime()), `provided createdAt value is invalid`);

	let reply: AppBskyFeedPost.ReplyRef | undefined;
	let rkey: string | undefined;

	if (thread.reply) {
		let post = thread.reply;

		if (typeof post === 'string') {
			// AT-URI being passed
			assertXrpc(rpc, `ComposedThread.reply`);
			post = await getPost(post);
		}

		let root: ComAtprotoRepoStrongRef.Main | undefined;
		let ref: ComAtprotoRepoStrongRef.Main;

		if ('record' in post) {
			// AppBskyFeedDefs.PostView being passed

			root = (post.record as AppBskyFeedPost.Record).reply?.root;
			ref = { uri: post.uri, cid: post.cid };
		} else if ('value' in post) {
			// AppBskyEmbedRecord.ViewRecord being passed

			root = (post.value as AppBskyFeedPost.Record).reply?.root;
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
		rkey = TID.createRaw(now.getTime(), Math.floor(Math.random() * 1023));

		const post = posts[idx];
		const uri = `at://${did}/app.bsky.feed.post/${rkey}`;

		// Resolve embeds
		let embed: AppBskyFeedPost.Record['embed'];
		if (post.embed !== undefined) {
			embed = await resolveEmbed(post.embed);
		}

		// Get the self-labels
		const labels = getEmbedLabels(post.embed);
		let selfLabels: Brand.Union<ComAtprotoLabelDefs.SelfLabels> | undefined;

		if (labels?.length) {
			selfLabels = {
				$type: 'com.atproto.label.defs#selfLabels',
				values: labels.map((val) => ({ val })),
			};
		}

		// Now form the record
		const content = post.content;

		const record: AppBskyFeedPost.Record = {
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
			const threadgateRecord: AppBskyFeedThreadgate.Record = {
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

	async function resolveEmbed(embed: PostEmbed): Promise<AppBskyFeedPost.Record['embed'] | undefined> {
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
		): Promise<Brand.Union<AppBskyEmbedExternal.Main | AppBskyEmbedImages.Main | AppBskyEmbedVideo.Main>> {
			const type = embed.type;

			if (type === 'external') {
				const rawThumb = embed.thumbnail;
				let thumb: At.Blob<any> | undefined;

				if (rawThumb !== undefined) {
					if (rawThumb instanceof Blob) {
						assertXrpc(rpc, `PostExternalEmbed.thumbnail`);
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
					let blob: At.Blob<any>;

					if (rawBlob instanceof Blob) {
						assertXrpc(rpc, `PostImageEmbed.images[].blob`);
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
				let blob: At.Blob<any> | undefined;

				if (rawBlob instanceof Blob) {
					assertXrpc(rpc, `PostVideoEmbed.blob`);
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

		async function resolveRecordEmbed(embed: PostRecordEmbed): Promise<Brand.Union<AppBskyEmbedRecord.Main>> {
			const uri = embed.uri;
			let cid = embed.cid;

			if (cid === undefined) {
				const type = embed.type;

				if (type === 'quote') {
					assertXrpc(rpc, 'PostQuoteEmbed');

					const post = await getPost(uri);

					cid = post.cid;
				} else if (type === 'feed') {
					assertXrpc(rpc, 'PostFeedEmbed');

					const { data } = await rpc.get('app.bsky.feed.getFeedGenerator', {
						signal: signal,
						params: { feed: uri },
					});

					cid = data.view.cid;
				} else if (type === 'list') {
					assertXrpc(rpc, 'PostListEmbed');

					const { data } = await rpc.get('app.bsky.graph.getList', {
						signal: signal,
						params: { list: uri, limit: 1 },
					});

					cid = data.list.cid;
				} else if (type === 'starterpack') {
					assertXrpc(rpc, 'PostStarterpackEmbed');

					const { data } = await rpc.get('app.bsky.graph.getStarterPack', {
						signal: signal,
						params: { starterPack: uri },
					});

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

	async function uploadBlob(blob: Blob): Promise<At.Blob> {
		// `rpc` intentionally non-null asserted.
		const { data } = await rpc!.call('com.atproto.repo.uploadBlob', {
			signal: signal,
			data: blob,
		});

		return data.blob;
	}

	async function getPost(uri: string): Promise<AppBskyFeedDefs.PostView> {
		// `rpc` intentionally non-null asserted.
		const { data } = await rpc!.get('app.bsky.feed.getPosts', {
			signal: signal,
			params: {
				uris: [uri],
			},
		});

		const post = data.posts[0];
		if (!post) {
			throw new XRPCError(400, { kind: 'NotFound', description: `Post not found: ${uri}` });
		}

		return post;
	}
}

function resolveThreadgate(gate: ComposedThreadgate): AppBskyFeedThreadgate.Record['allow'] {
	const rules: AppBskyFeedThreadgate.Record['allow'] = [];

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

function assertXrpc(rpc: XRPC | undefined, thing: string): asserts rpc {
	if (rpc === undefined) {
		throw new Error(`${thing} requires supplying RPC instance`);
	}
}
