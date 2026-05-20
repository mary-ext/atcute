// oxlint-disable typescript/no-explicit-any

// realistic validation benchmark using post shapes sampled from the Bluesky firehose
// distribution (20k sample from Jetstream, 2026-03-18):
//   reply: 32.5% | plain-text: 22.5% | external+link: 6.7% | images: 6.7%
//   external: 6.2% | quote: 3.7% | images+tags: 2.4% | video: 0.7%
//   recordWithMedia: 0.4% | external+labels: 0.1%

import { is } from '@atcute/lexicons';

import * as atproto from '@atproto/api';
import { bench, do_not_optimize, run, summary } from 'mitata';

import * as atcute from './lexicons/index.ts';

function pair(record: object) {
	summary(() => {
		bench('atcute', function* () {
			yield {
				[0]() {
					return structuredClone(record);
				},
				bench(r: any) {
					return do_not_optimize(is(atcute.AppBskyFeedPost.mainSchema, r));
				},
			};
		});

		bench('atproto', function* () {
			yield {
				[0]() {
					return atproto.jsonToLex(structuredClone(record));
				},
				bench(r: any) {
					return do_not_optimize(atproto.AppBskyFeedPost.validateRecord(r));
				},
			};
		});
	});
}

// #region plain text (en) — 22.5% of firehose
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T10:30:17.175Z',
	langs: ['en'],
	text: "The five constipated men in the Bible? Cain - He wasn't Abel.\nKing David - Heaven and Earth couldn't move him.\nKing Solomon - He sat on the throne for 40 years.\nMoses - He took two tablets and went up on the mountain.\nAnd Noah - He spent 40 days and 40 nights in the Ark, and passed nothing but water",
});
// #endregion

// #region plain text (ja) — CJK grapheme counting, ~19% of posts
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T10:30:16.385Z',
	langs: ['ja'],
	text: 'マンゴーかき氷が食べたい。おいしいパイナップルケーキも買いたい。各自一つ火鍋が与えられるらしい火鍋も行きたい。麺線も食べたいです。',
});
// #endregion

// #region reply (en) — 32.5% of firehose
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T10:30:16.850Z',
	langs: ['en'],
	reply: {
		parent: {
			cid: 'bafyreieh67kdw2s5kgc2beiv7rgcf6yaryagmvez2q5qc2kzkweprietvm',
			uri: 'at://did:plc:6tmzbiftwxfgnxz6b5t2ylsh/app.bsky.feed.post/3mhbkounjys2m',
		},
		root: {
			cid: 'bafyreieh67kdw2s5kgc2beiv7rgcf6yaryagmvez2q5qc2kzkweprietvm',
			uri: 'at://did:plc:6tmzbiftwxfgnxz6b5t2ylsh/app.bsky.feed.post/3mhbkounjys2m',
		},
	},
	text: "I would've had a breakdown after the first thing, so I can already tell you're stronger than I.",
});
// #endregion

// #region images embed — 6.7%
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T10:30:10.415Z',
	embed: {
		$type: 'app.bsky.embed.images',
		images: [
			{
				alt: '',
				aspectRatio: {
					height: 2000,
					width: 1500,
				},
				image: {
					$type: 'blob',
					ref: {
						$link: 'bafkreibjfybaa44yecbited3s6i3swbvh4eebh2z7n3mtwyw3r3lykyjwe',
					},
					mimeType: 'image/jpeg',
					size: 918219,
				},
			},
		],
	},
	langs: ['en'],
	text: 'peak doodle',
});
// #endregion

// #region external link + link facet — 6.7%
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T10:30:15.152Z',
	embed: {
		$type: 'app.bsky.embed.external',
		external: {
			description: '',
			thumb: {
				$type: 'blob',
				ref: {
					$link: 'bafkreiaax6qmoecxx2h5uh6fhlqi2ejhyandzsozds7s6owa3rqqvvxkgq',
				},
				mimeType: 'image/jpeg',
				size: 30903,
			},
			title: 'paradise 1997',
			uri: 'https://open.spotify.com/track/5tyGDQeYTbqxLHsuAvWvcF?si=0GK1IDV5SHqGWhEcrjJdDg',
		},
	},
	facets: [
		{
			features: [
				{
					$type: 'app.bsky.richtext.facet#link',
					uri: 'https://open.spotify.com/track/5tyGDQeYTbqxLHsuAvWvcF?si=0GK1IDV5SHqGWhEcrjJdDg',
				},
			],
			index: {
				byteEnd: 37,
				byteStart: 5,
			},
		},
	],
	langs: ['en'],
	text: 'mood\nopen.spotify.com/track/5tyGDQ...',
});
// #endregion

// #region quote post (embed.record) — 3.7%
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T10:30:16.953Z',
	embed: {
		$type: 'app.bsky.embed.record',
		record: {
			cid: 'bafyreiheczsalzhd36m64swmbsyjmsfxo7xyfxg3gayo4auawejt7hdklq',
			uri: 'at://did:plc:jqxoz37667iqtse4cbv2pge3/app.bsky.feed.post/3mhbf3vrsi22g',
		},
	},
	langs: ['en'],
	text: '"Well, I rode through the desert on a horse with no name..."',
});
// #endregion

// #region images + tag facets — 2.4%
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T10:30:17.690Z',
	embed: {
		$type: 'app.bsky.embed.images',
		images: [
			{
				alt: '',
				aspectRatio: {
					height: 1610,
					width: 2000,
				},
				image: {
					$type: 'blob',
					ref: {
						$link: 'bafkreiabwucd3gnplugjzgunc7g3owz5t2dufzkfj7vwig2xhh77mdcl5m',
					},
					mimeType: 'image/jpeg',
					size: 424839,
				},
			},
		],
	},
	facets: [
		{
			features: [
				{
					$type: 'app.bsky.richtext.facet#tag',
					tag: '叢雲掲示板',
				},
			],
			index: {
				byteEnd: 16,
				byteStart: 0,
			},
		},
	],
	langs: ['ja'],
	text: '#叢雲掲示板\nがう',
});
// #endregion

// #region video embed — 0.7%
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T10:30:19.713Z',
	embed: {
		$type: 'app.bsky.embed.video',
		aspectRatio: {
			height: 2340,
			width: 1080,
		},
		presentation: 'default',
		video: {
			$type: 'blob',
			ref: {
				$link: 'bafkreigrbgdmc6jlkpnarpgxm5cdnswroqgm6rcsfan7w2sdhpcgin4qd4',
			},
			mimeType: 'video/mp4',
			size: 446877,
		},
	},
	langs: ['en'],
	text: 'I was looking for the "SNOP" panel in Homestuck and it took me to the revamped mspa site and oh my god...\n\nTHE HAMBURGER MENU ON MOBILE IS A SHITTY JPEG OF A HAMBURGER.',
});
// #endregion

// #region record with media — 0.4%, most complex embed type
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T10:30:54.585Z',
	embed: {
		$type: 'app.bsky.embed.recordWithMedia',
		media: {
			$type: 'app.bsky.embed.images',
			images: [
				{
					alt: '',
					aspectRatio: {
						height: 1000,
						width: 1000,
					},
					image: {
						$type: 'blob',
						ref: {
							$link: 'bafkreidxsvr467n65lox5btrv3ysnxkzmehgbzogqk46ho6sw67apuauyu',
						},
						mimeType: 'image/jpeg',
						size: 185316,
					},
				},
				{
					alt: '',
					aspectRatio: {
						height: 1920,
						width: 1080,
					},
					image: {
						$type: 'blob',
						ref: {
							$link: 'bafkreic6romobsny3aavmkgqysqbt54z27htkwtp4rdjjyszneasstxjz4',
						},
						mimeType: 'image/jpeg',
						size: 947838,
					},
				},
			],
		},
		record: {
			$type: 'app.bsky.embed.record',
			record: {
				cid: 'bafyreigtx64bk7d63alydtfbpt5m3ebhh2cpybvncozxawuvvyso37aqfu',
				uri: 'at://did:plc:vvn4cqb6l3mc4dg7n2lh6xb4/app.bsky.feed.post/3mhd2mqhahc2h',
			},
		},
	},
	langs: ['es'],
	text: 'Icon vs user!!',
});
// #endregion

// #region external + self-labels (bot/feed posts) — 0.1%
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T09:58:36.000000Z',
	embed: {
		$type: 'app.bsky.embed.external',
		external: {
			description:
				'Former reality TV star Jessie Holmes cruised to a repeat victory in the Iditarod, the roughly 1,000-mile sled dog race in Alaska',
			thumb: {
				$type: 'blob',
				ref: {
					$link: 'bafkreica5staxokii3db6xkxrzpnadh6rfptxexca3gtjqbvwoby5ghpsu',
				},
				mimeType: 'image/jpeg',
				size: 235971,
			},
			title:
				'Former reality TV star Jessie Holmes repeats as champion of the grueling Iditarod sled dog race',
			uri: 'https://www.independent.co.uk/news/alaska-bering-sea-national-geographic-anchorage-willow-b2940836.html',
		},
	},
	facets: [],
	labels: {
		$type: 'com.atproto.label.defs#selfLabels',
		values: [],
	},
	langs: [],
	tags: [],
	text: 'Former reality TV star Jessie Holmes repeats as champion of the grueling Iditarod sled dog race\n\nFormer reality TV star Jessie Holmes cruised to a repeat victory in the Iditarod, the roughly 1,000-mile sled dog race in Alaska\n',
});
// #endregion

// #region grapheme stress test — family emoji at max grapheme limit
pair({
	$type: 'app.bsky.feed.post',
	createdAt: '2026-03-18T00:00:00.000Z',
	text: '\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}'.repeat(90),
});
// #endregion

await run();
