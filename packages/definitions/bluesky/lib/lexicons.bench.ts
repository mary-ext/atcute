import { bench, do_not_optimize, run, summary } from 'mitata';

import { is } from '@atcute/lexicons';

import * as atcute from './lexicons/index.js';
import * as atproto from '@atproto/api';

summary(() => {
	bench('atcute', function* () {
		yield {
			[0]() {
				return {
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
			},
			bench(record: any) {
				return do_not_optimize(is(atcute.AppBskyFeedPost.mainSchema, record));
			},
		};
	});

	bench('atproto', function* () {
		yield {
			[0]() {
				return atproto.jsonToLex({
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
				});
			},
			bench(record: any) {
				return do_not_optimize(atproto.AppBskyFeedPost.validateRecord(record));
			},
		};
	});
});

await run();
