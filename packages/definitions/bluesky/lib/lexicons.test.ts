import { describe, it } from 'vitest';

import { parse } from '@atcute/lexicons';

import { AppBskyFeedDefs, AppBskyFeedPost } from './lexicons/index.js';

describe('app.bsky.feed.post', () => {
	it('validates post record', () => {
		const record: AppBskyFeedPost.Main = {
			$type: 'app.bsky.feed.post',
			createdAt: '2024-01-16T02:11:28.664Z',
			embed: {
				$type: 'app.bsky.embed.images',
				images: [
					{
						alt: 'Kit sleeping on me',
						aspectRatio: {
							height: 2000,
							width: 1500,
						},
						image: {
							$type: 'blob',
							ref: {
								$link: 'bafkreieg74vbe3b5xyro3mcflzm2mb5yf525myeu2bgcif35kopii4eh5m',
							},
							mimeType: 'image/jpeg',
							size: 806879,
						},
					},
				],
			},
			langs: ['en'],
			reply: {
				parent: {
					cid: 'bafyreiefj6k42eyvufxz7ux3i2nyzefgpjmavapto7zlcrfhzspe3eijxu',
					uri: 'at://did:plc:34d6gxlllrndltpas55xfedz/app.bsky.feed.post/3kj2ujyplal2i',
				},
				root: {
					cid: 'bafyreihzdxsclc45we52wdy2ui7er7b6rxgh36vpoy6ecnegkujwk6yj5m',
					uri: 'at://did:plc:ragtjsm2j2vknwkz3zp4oxrd/app.bsky.feed.post/3kj2uf2sole2u',
				},
			},
			text: 'angel mode',
		};

		parse(AppBskyFeedPost.mainSchema, record);
	});
});

describe('app.bsky.feed.defs', () => {
	it('validates threadViewPost', () => {
		const thread: AppBskyFeedDefs.ThreadViewPost = {
			$type: 'app.bsky.feed.defs#threadViewPost',
			post: {
				uri: 'at://did:plc:2ywwoi4lylknlhjcrlekq6za/app.bsky.feed.post/3lozqc2jhvs2j',
				cid: 'bafyreig3o33snzb4yoqqjhifxhg6vto6wgdrl2zgfj52dmazlbfzzm73pq',
				author: {
					did: 'did:plc:2ywwoi4lylknlhjcrlekq6za',
					handle: 'gabrielpeyre.bsky.social',
					displayName: 'Gabriel Peyré',
					avatar:
						'https://cdn.bsky.app/img/avatar/plain/did:plc:2ywwoi4lylknlhjcrlekq6za/bafkreid64svkuwu34ow6fd24ehkdfaj6umybd5ug2n7kiasg3iy7agefli@jpeg',
					viewer: {
						muted: false,
						blockedBy: false,
					},
					labels: [],
					createdAt: '2024-11-22T19:55:15.115Z',
				},
				record: {
					$type: 'app.bsky.feed.post',
					createdAt: '2025-05-13T05:18:28.059Z',
					embed: {
						$type: 'app.bsky.embed.external',
						external: {
							description:
								'Optimal Transport is a foundational mathematical theory that connects optimization, partial differential equations, and probability. It offers a powerful framework for comparing probability distributi...',
							thumb: {
								$type: 'blob',
								ref: {
									$link: 'bafkreid5ef6vsscqwei75f6d6ixwxru7unutp2iqw6zabq2c7k3hykpboq',
								},
								mimeType: 'image/jpeg',
								size: 64289,
							},
							title: 'Optimal Transport for Machine Learners',
							uri: 'http://arxiv.org/abs/2505.06589',
						},
					},
					facets: [
						{
							features: [
								{
									$type: 'app.bsky.richtext.facet#link',
									uri: 'http://arxiv.org/abs/2505.06589',
								},
							],
							index: {
								byteEnd: 104,
								byteStart: 80,
							},
						},
					],
					langs: ['fr'],
					text: 'I have cleaned a bit my lecture notes on Optimal Transport for Machine Learners arxiv.org/abs/2505.06589',
				},
				embed: {
					$type: 'app.bsky.embed.external#view',
					external: {
						uri: 'http://arxiv.org/abs/2505.06589',
						title: 'Optimal Transport for Machine Learners',
						description:
							'Optimal Transport is a foundational mathematical theory that connects optimization, partial differential equations, and probability. It offers a powerful framework for comparing probability distributi...',
						thumb:
							'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:2ywwoi4lylknlhjcrlekq6za/bafkreid5ef6vsscqwei75f6d6ixwxru7unutp2iqw6zabq2c7k3hykpboq@jpeg',
					},
				},
				replyCount: 0,
				repostCount: 21,
				likeCount: 66,
				quoteCount: 0,
				indexedAt: '2025-05-13T05:18:29.516Z',
				viewer: {
					threadMuted: false,
					embeddingDisabled: false,
				},
				labels: [],
			},
			replies: [],
			threadContext: {},
		};

		parse(AppBskyFeedDefs.threadViewPostSchema, thread);
	});
});
