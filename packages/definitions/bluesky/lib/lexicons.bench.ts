import { bench, do_not_optimize, run, summary } from 'mitata';

import { is } from '@atcute/lexicons';

import * as atproto from '@atproto/api';
import * as atcute from './lexicons/index.js';

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

summary(() => {
	bench('atcute', function* () {
		yield {
			[0]() {
				return {
					$type: 'app.bsky.feed.post',
					createdAt: '2025-05-13T21:16:55.043Z',
					embed: {
						$type: 'app.bsky.embed.images',
						images: [
							{
								alt: 'As explained below, Columbia University has been advised by immigration authorities that YUNSEO CHUNG is now present in the United States and that RANJANI SRINIVASAN was a removable alien and YUNSEO CHUNG is a removable\nalien. Despite this knowledge, Columbia University has refused, and continues to refuse, to permit immigration officers to locate and arrest RANJANI SRINIVASAN and YUNSEO CHUNG at their student housing and were and are thus concealing, harboring, or shielding from detection removable aliens, RANJANI SRINIVASAN and YUNSEO CHUNG, or are\nconspiring to do so.',
								aspectRatio: {
									height: 658,
									width: 1382,
								},
								image: {
									$type: 'blob',
									ref: {
										$link: 'bafkreievlpk5ra3mcdhcll3dkxnet5cncj4wmo6ofg75tee3wbynfm6dfq',
									},
									mimeType: 'image/jpeg',
									size: 406921,
								},
							},
						],
					},
					facets: [
						{
							features: [
								{
									$type: 'app.bsky.richtext.facet#link',
									uri: 'https://storage.courtlistener.com/recap/gov.uscourts.nysd.639187/gov.uscourts.nysd.639187.49.0.pdf#page=2.00',
								},
							],
							index: {
								byteEnd: 305,
								byteStart: 264,
							},
						},
					],
					langs: ['en'],
					text: 'NEW: ICE persuaded a magistrate judge that Columbia was violating 8 USC § 1324 by "harboring aliens" — i.e., students Yunseo Chung and Ranjani Srinivasan — by refusing to invite ICE onto its private campus to capture them, per the newly unsealed application. storage.courtlistener.com/recap/gov.us...',
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
					createdAt: '2025-05-13T21:16:55.043Z',
					embed: {
						$type: 'app.bsky.embed.images',
						images: [
							{
								alt: 'As explained below, Columbia University has been advised by immigration authorities that YUNSEO CHUNG is now present in the United States and that RANJANI SRINIVASAN was a removable alien and YUNSEO CHUNG is a removable\nalien. Despite this knowledge, Columbia University has refused, and continues to refuse, to permit immigration officers to locate and arrest RANJANI SRINIVASAN and YUNSEO CHUNG at their student housing and were and are thus concealing, harboring, or shielding from detection removable aliens, RANJANI SRINIVASAN and YUNSEO CHUNG, or are\nconspiring to do so.',
								aspectRatio: {
									height: 658,
									width: 1382,
								},
								image: {
									$type: 'blob',
									ref: {
										$link: 'bafkreievlpk5ra3mcdhcll3dkxnet5cncj4wmo6ofg75tee3wbynfm6dfq',
									},
									mimeType: 'image/jpeg',
									size: 406921,
								},
							},
						],
					},
					facets: [
						{
							features: [
								{
									$type: 'app.bsky.richtext.facet#link',
									uri: 'https://storage.courtlistener.com/recap/gov.uscourts.nysd.639187/gov.uscourts.nysd.639187.49.0.pdf#page=2.00',
								},
							],
							index: {
								byteEnd: 305,
								byteStart: 264,
							},
						},
					],
					langs: ['en'],
					text: 'NEW: ICE persuaded a magistrate judge that Columbia was violating 8 USC § 1324 by "harboring aliens" — i.e., students Yunseo Chung and Ranjani Srinivasan — by refusing to invite ICE onto its private campus to capture them, per the newly unsealed application. storage.courtlistener.com/recap/gov.us...',
				});
			},
			bench(record: any) {
				return do_not_optimize(atproto.AppBskyFeedPost.validateRecord(record));
			},
		};
	});
});

summary(() => {
	bench('atcute', function* () {
		yield {
			[0]() {
				const record: atcute.AppBskyFeedPost.Main = {
					$type: 'app.bsky.feed.post',
					createdAt: new Date().toISOString(),
					text: '👨‍👩‍👧‍👦'.repeat(90),
				};

				return record;
			},
			bench(record: any) {
				return do_not_optimize(is(atcute.AppBskyFeedPost.mainSchema, record));
			},
		};
	});

	bench('atproto', function* () {
		yield {
			[0]() {
				const record: atcute.AppBskyFeedPost.Main = {
					$type: 'app.bsky.feed.post',
					createdAt: new Date().toISOString(),
					text: '👨‍👩‍👧‍👦'.repeat(90),
				};

				return atproto.jsonToLex(record);
			},
			bench(record: any) {
				return do_not_optimize(atproto.AppBskyFeedPost.validateRecord(record));
			},
		};
	});
});

await run();
